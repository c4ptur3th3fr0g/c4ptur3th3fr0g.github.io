---
tags:
  - crypto
  - mersenne
  - z3
---

# Seedy

## Solution

Solution using sage and Z3

```python
#! /usr/bin/env python
import random
from tqdm import trange
from sage.all import matrix, GF, vector
from Cryptodome.Util.number import long_to_bytes
from re import search

# from https://github.com/deut-erium/RNGeesus/blob/main/src/code_mersenne/
from mersenne import BreakerPy


# https://rbtree.blog/posts/2021-05-18-breaking-python-random-module/
class Twister:
    N = 624
    M = 397
    A = 0x9908B0DF

    def __init__(self):
        self.state = [
            [(1 << (32 * i + (31 - j))) for j in range(32)] for i in range(624)
        ]
        self.index = self.N

    @staticmethod
    def _xor(a, b):
        return [x ^ y for x, y in zip(a, b)]

    @staticmethod
    def _and(a, x):
        return [v if (x >> (31 - i)) & 1 else 0 for i, v in enumerate(a)]

    @staticmethod
    def _shiftr(a, x):
        return [0] * x + a[:-x]

    @staticmethod
    def _shiftl(a, x):
        return a[x:] + [0] * x

    def get32bits(self):
        if self.index >= self.N:
            for kk in range(self.N):
                y = self.state[kk][:1] + self.state[(kk + 1) % self.N][1:]
                z = [y[-1] if (self.A >> (31 - i)) & 1 else 0 for i in range(32)]
                self.state[kk] = self._xor(
                    self.state[(kk + self.M) % self.N], self._shiftr(y, 1)
                )
                self.state[kk] = self._xor(self.state[kk], z)
            self.index = 0

        y = self.state[self.index]
        y = self._xor(y, self._shiftr(y, 11))
        y = self._xor(y, self._and(self._shiftl(y, 7), 0x9D2C5680))
        y = self._xor(y, self._and(self._shiftl(y, 15), 0xEFC60000))
        y = self._xor(y, self._shiftr(y, 18))
        self.index += 1

        return y

    def getrandbits(self, bit):
        return self.get32bits()[:bit]


def gf2tovec(v):
    return [sum([2 ** j * int(v[i * 32 + j]) for j in range(32)]) for i in range(624)]


def get_initial_state(outputs, tbit):
    num = len(outputs)
    twister = Twister()
    equations = [twister.getrandbits(tbit) for _ in range(num)]
    Fp2 = GF(2)
    n, m = num * tbit, 624 * 32
    M = matrix(Fp2, n, m, sparse=False)
    b = vector(Fp2, n)
    for i in trange(num):
        for j in range(tbit):
            ii = i * tbit + j
            v = equations[i][j]
            while v:
                nv = v & (v - 1)
                k = (v ^ nv).bit_length() - 1
                M[ii, k] = 1
                v = nv
            b[ii] = (outputs[i] >> (tbit - 1 - j)) & 1
    # not sure if this is needed
    # ke = M.right_kernel()
    # for r in ke.basis():
    #     assert M * r == 0
    x = M.solve_right(b)
    # assert M * x == b
    state = gf2tovec(x)
    # recovered_state = (3, tuple(state + [624]), None)
    # random.setstate(recovered_state)
    # for i in range(num):
    #    assert outputs[i] == random.getrandbits(tbit)
    return state


def recover_bytes_seed(state):
    b = BreakerPy()
    random.setstate((3, tuple(state + [624]), None))
    outputs = [random.getrandbits(32) for _ in range(624)]
    seed = b.get_seeds_python_fast(outputs)
    return seed


if __name__ == "__main__":
    with open("output.txt") as fo:
        outputs = list(map(int, fo.read().strip()))
    state = get_initial_state(outputs, 1)
    seed = recover_bytes_seed(state)
    flag = 0
    for n in reversed(seed):
        flag = (flag << 32) ^ n
    flag = long_to_bytes(flag)
    flag = search(b'idek{[!-z]*}', flag).group(0).decode()
    print(flag)
```

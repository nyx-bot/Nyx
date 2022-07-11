# Nyx **v3**<br><sup>except they're open source</sup>

welcome to the official repo of nyx v3, the source of syl's headaches.

-------

### Updating the packages

Considering that there is no actual one-liner way to do this, and to save myself the effort of finding it every time, I'll just throw it here.

```bash
npm i -g npm-check-updates
# linux: run this with sudo -- installing global packages requires elevated permissions

# now run this command in the working directory of the bot:
ncu -u

# it will tell you to install the packages, since it just overwrites the package.json file:
npm i
```

that's all lol
#   commandos Change Log

Notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning 2.0.0](http://semver.org/).

##	[0.1.1] - 2021-07-26

指定可执行命令脚本（之前的版本未指定，导致全局安装完成后未生成相应的全局命令）。  
Assign `"directories.bin"` in `package.json`. It was a low-level mistake that prevented it from creating global command on `npm install -g ...`.

##	[0.1.0] - 2021-04-14

Update dependencies.

##	[0.0.1] - 2021-02-22

Released.

---
This CHANGELOG.md follows [*Keep a CHANGELOG*](http://keepachangelog.com/).

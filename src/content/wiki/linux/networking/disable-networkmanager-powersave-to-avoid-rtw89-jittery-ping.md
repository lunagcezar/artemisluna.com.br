---
title: Disable NetworkManager powersave to avoid RTW89 jittery ping
description: Fix unstable ping and jitter on Realtek RTW89 Wi-Fi adapters by disabling NetworkManager powersave.
date: 2025-09-26 13:42 -03:00
author: Luna G. Cezar
tags:
  - linux
  - networking
  - wifi
---

Create a file in the `/etc/NetworkManager/conf.d` directory

**`wifi-powersave-off.conf`**

```conf
[connection]
wifi.powersave = 2
```

Now the Realtek Wifi adapter will have stable pings.

**Created:** 2025-09-26

## References

1. https://github.com/lwfinger/rtw89/issues/36#issuecomment-2305564431

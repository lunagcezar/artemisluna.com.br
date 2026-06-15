---
title: Ubuntu 24.10 auto decrypt secondary drives workaround
description: Workaround for slow boot and missing auto-mount of secondary encrypted drives after upgrading to Ubuntu 24.10.
date: 2024-10-12 23:49 -03:00
author: Luna G. Cezar
tags:
  - linux
  - encryption
  - ubuntu
---

# Ubuntu 24.10 auto decrypt secondary drives workaround

**Created:** 2024-10-12

If you are upgrading Ubuntu from version 24.04 to 24.10 and used the [[encrypt-second-drive-when-the-first-is-encrypted-with-tpm]] guide, you'll probably notice that the boot process is much slower and the auto mount for secondary encrypted drives doesn't work, entering in the emergency mode.

To solve this problem, you need to comment or exclude the references to the encrypted secondary drives listed in the `/etc/crypttab` and `/etc/fstab` files.

After that, you need to create a bash script in the `/usr/local/sbin` directory:

```bash
sudo nano /usr/local/sbin/fix-auto-crypt-mount.sh
```

In the `fix-auto-crypt-mount.sh` file, add this code and replace the variables with the proper information:

```bash
#!/bin/bash
cryptsetup open --type luks2 ${YOUR_DRIVE} --key-file ${PATH_TO_KEY_FILE} ${DEVICE_MAPPER_NAME}
mount /dev/mapper/${DEVICE_MAPPER_NAME} ${MOUNT_POINT}
```

**Variables:**

- **YOUR_DRIVE**: Your drive identification, like `/dev/sda` or UUID;
- **PATH_TO_KEY_FILE**: The path for the key file that you created in the [[encrypt-second-drive-when-the-first-is-encrypted-with-tpm]] guide;
- **DEVICE_MAPPER_NAME**: A chosen name by you for the device. It can be any name.
- **MOUNT_POINT**: The directory that will show the directories of your encrypted partition.

To restrict access for this script, use this command:

```bash
sudo chmod 0700 /usr/local/sbin/fix-auto-crypt-mount.sh
```

Furthermore, as you won't be using the fstab to automatically mount this partition, you need another method to initiate the mount. In this case, you can use systemd to help invoke these commands as root before login.

So, it is necessary to create a new systemd service in the `/etc/systemd/system` directory:

```bash
sudo nano /etc/systemd/system/fix-auto-crypt-mount.service
```

Add this code to the `fix-auto-crypt-mount.service`:

```ini
[Unit]
Description=Fix encryption auto mount of /dev/${DEVICE_MAPPER_NAME}
[Service]
ExecStart=/usr/local/sbin/fix-auto-crypt-mount.sh
[Install]
WantedBy=multi-user.target
```

Now, change the permissions for this file:

```bash
sudo chmod 0755 /etc/systemd/system/fix-auto-crypt-mount.service
```

Finally, you can enable the service, running on the next startup:

```bash
sudo systemctl enable fix-auto-crypt-mount.service
```

## References

1. [Running a sudo command automatically on startup](https://unix.stackexchange.com/questions/645914/running-a-sudo-command-automatically-on-startup)

[encrypt-second-drive-when-the-first-is-encrypted-with-tpm]: encrypt-second-drive-when-the-first-is-encrypted-with-tpm "Encrypt second drive when the first is encrypted with TPM"

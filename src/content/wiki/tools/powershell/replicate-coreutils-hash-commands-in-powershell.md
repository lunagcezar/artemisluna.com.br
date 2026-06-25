---
title: "Replicate GNU Coreutils hash commands in PowerShell"
description: ""
tags:
  - powershell
  - checksum
  - hash
  - md5sum
  - sha1sum
  - sha256sum
  - sha512sum
date: 2026-06-24
author: Luna G. Cezar
lang: en
index: false
---

[[powershell]] has a command to get checksums with the command `Get-Filehash`, but, if you prefer the GNU Coreutils' simpler syntax, it is possible to replicate this behavior using a script block and creating each checksum function that you need. This code also covers the file checking use case (e.g. `sha256sum -c $FILE`).

```powershell
$checksum = {
	param(
		[string]$Algorithm,
		[string[]]$Arguments
	)

	if ($Arguments.Count -ge 2 -and $Arguments[0] -eq "-c") {
		$checksumFile = $Arguments[1]

		Get-Content $checksumFile | ForEach-Object {
			if ($_ -match '^([a-fA-F0-9]+)\s+\*?(.+)$') {
				$expected = $matches[1].ToLower()
				$file = $matches[2]

				if (-not (Test-Path $file)) {
					"$($file): NOT FOUND"
					return
				}

				$actual = (Get-FileHash -Algorithm $Algorithm -Path $file).Hash.ToLower()

				if ($actual -eq $expected) {
					"$($file): OK"
				}
				else {
					"$($file): FAILED"
				}
			}
		}
	}
	else {
		Get-FileHash -Algorithm $Algorithm -Path $Arguments |
		ForEach-Object {
			"{0} {1}" -f $_.Hash.ToLower(), (Split-Path $_.Path -Leaf)
		}
	}
}

function md5sum {
	& $checksum MD5 $args
}

function sha1sum {
	& $checksum SHA1 $args
}

function sha256sum {
	& $checksum SHA256 $args
}

function sha512sum {
	& $checksum SHA512 $args
}
```

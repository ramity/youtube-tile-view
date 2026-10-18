#!/bin/sh
# Package the Firefox extension into a zip/xpi artifact using web-ext
web-ext build --overwrite-dest --source-dir /app --artifacts-dir /artifacts

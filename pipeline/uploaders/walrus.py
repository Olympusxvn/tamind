"""Upload Parquet to TaMind API (Seal V2 encrypt + Walrus)."""

from __future__ import annotations

import json
import os
import urllib.request
from pathlib import Path


def upload_via_api(parquet_path: Path, title: str, price_mist: str) -> dict:
    api = os.environ.get("TAMIND_API_URL", "http://localhost:3001")
    boundary = "----tamind"
    body = b""
    body += f"--{boundary}\r\n".encode()
    body += b'Content-Disposition: form-data; name="title"\r\n\r\n'
    body += title.encode() + b"\r\n"
    body += f"--{boundary}\r\n".encode()
    body += b'Content-Disposition: form-data; name="priceMist"\r\n\r\n'
    body += price_mist.encode() + b"\r\n"
    body += f"--{boundary}\r\n".encode()
    body += f'Content-Disposition: form-data; name="file"; filename="{parquet_path.name}"\r\n'.encode()
    body += b"Content-Type: application/octet-stream\r\n\r\n"
    body += parquet_path.read_bytes() + b"\r\n"
    body += f"--{boundary}--\r\n".encode()

    req = urllib.request.Request(
        f"{api}/api/datasets/upload",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=600) as resp:
        return json.loads(resp.read())

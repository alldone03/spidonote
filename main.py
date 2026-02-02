import requests
import json
from datetime import date

API_URL = "https://script.google.com/macros/s/AKfycbzZfDz7TmytH0pVH_fiaquHKquSabIn0okZsm3bwSKUexlN37OtYwCkKeTivFwx05Qr/exec"

def test_bbm():
    payload = {
        "type": "bbm",
        "tanggal": date.today().isoformat(),
        "kilometer": 12800,
        "liter": 5.2,
        "harga": 75000
    }

    r = requests.post(
        API_URL,
        headers={"Content-Type": "text/plain;charset=utf-8"},
        data=json.dumps(payload),
        timeout=10
    )

    print("BBM STATUS :", r.status_code)
    print("BBM RESPONSE:", r.text)


def test_oli():
    payload = {
        "type": "oli",
        "tanggal": date.today().isoformat(),
        "kilometer": 12800,
        "jenis_oli": "10W-40",
        "aksi": "Ganti",
        "catatan": "Mesin lebih halus"
    }

    r = requests.post(
        API_URL,
        headers={"Content-Type": "text/plain;charset=utf-8"},
        data=json.dumps(payload),
        timeout=10
    )

    print("OLI STATUS :", r.status_code)
    print("OLI RESPONSE:", r.text)


if __name__ == "__main__":
    print("=== TEST BBM ===")
    test_bbm()

    print("\n=== TEST OLI ===")
    test_oli()
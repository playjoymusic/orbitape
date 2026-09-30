# -*- coding: utf-8 -*-
"""PNG okuyucu: 8-bit RGB/RGBA, interlanced degil. Canli sayfayi
piksel duzeyinde olcmek icin (renk karsilastirmasi)."""
import zlib, struct

def oku(yol):
    d = open(yol, 'rb').read()
    assert d[:8] == b'\x89PNG\r\n\x1a\n', 'PNG degil'
    i, w, h, der, renk = 8, None, None, None, None
    veri = b''
    while i < len(d):
        ln = struct.unpack('>I', d[i:i+4])[0]
        tur = d[i+4:i+8]
        g = d[i+8:i+8+ln]
        if tur == b'IHDR':
            w, h, der, renk = struct.unpack('>IIBB', g[:10])
        elif tur == b'IDAT':
            veri += g
        elif tur == b'IEND':
            break
        i += 12 + ln
    k = 3 if renk == 2 else 4
    ham = zlib.decompress(veri)
    satir = w * k
    out = bytearray(h * satir)
    p = 0
    for y in range(h):
        ft = ham[p]; p += 1
        s = bytearray(ham[p:p+satir]); p += satir
        if ft == 1:
            for x in range(k, satir): s[x] = (s[x] + s[x-k]) & 255
        elif ft == 2:
            if y:
                for x in range(satir): s[x] = (s[x] + out[(y-1)*satir + x]) & 255
        elif ft == 3:
            for x in range(satir):
                a = s[x-k] if x >= k else 0
                b = out[(y-1)*satir + x] if y else 0
                s[x] = (s[x] + ((a + b) >> 1)) & 255
        elif ft == 4:
            for x in range(satir):
                a = s[x-k] if x >= k else 0
                b = out[(y-1)*satir + x] if y else 0
                c = out[(y-1)*satir + x-k] if (y and x >= k) else 0
                pa, pb, pc = abs(b-c), abs(a-c), abs(a+b-2*c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                s[x] = (s[x] + pr) & 255
        out[y*satir:(y+1)*satir] = s
    return w, h, k, out

def px(out, w, k, x, y):
    i = (y*w + x)*k
    return (out[i], out[i+1], out[i+2])

def lum(c):
    f = lambda v: (v/255)/12.92 if (v/255) <= 0.03928 else (((v/255)+0.055)/1.055) ** 2.4
    return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2])

def kontrast(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb)+0.05)/(min(la, lb)+0.05)

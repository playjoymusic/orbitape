#!/bin/bash
# Kancalari bu klona kur. Git kancalari depoyla birlikte GELMEZ
# (.git/hooks surum kontrolunde degil), o yuzden her yeni klonda bir
# kere calistirilmasi gerekiyor -- KURTARMA.md'de de yaziyor.
kok="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "git deposu degil"; exit 1; }
mkdir -p "$kok/.git/hooks"
cp "$kok/araclar/kanca/pre-push" "$kok/.git/hooks/pre-push"
chmod +x "$kok/.git/hooks/pre-push"
echo "pre-push kancasi kuruldu: $kok/.git/hooks/pre-push"
echo "Bundan sonra bayat CSP ozetiyle push edilemez."

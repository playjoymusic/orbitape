/* ORBITAPE — MOOD SEMBOLLERI: veri + secim mantigi
 * ─────────────────────────────────────────────────────────────────────
 * NE
 *   RADIOTAPE modunda #bekle'deki 3 sembol (AYAR.sembolSpin KAPALIYKEN,
 *   varsayilan) artik soyut ALIEN ikonlari degil, birer "mood" -- her
 *   biri elle secilmis, GERCEK istasyonlardan olusan bir havuza baglı.
 *   Birine dokunmak o havuzdan rastgele bir istasyona ANINDA gecer.
 *
 * NEDEN AYRI DOSYA
 *   Once bu veri (o zaman tam istasyon nesneleriyle: mp3+ad+grup+ulke)
 *   index.html icindeydi ve "Ham boy < 1272 KB" testini asiyordu.
 *   Yalnizca kimlikleri (stationuuid) tasimaya gecince boyut sorunu
 *   cozuldu, ama ayni veri BU SEFER "Ilk cizim icin inen boy" (ilk
 *   boyama butcesi) testini astı (17 Eylul, 110 KB -> 112 KB brotli):
 *   veri gercekte ilk boyamada GEREKMIYOR -- yalnizca radyo modunda ve
 *   kullanici gercekten bir sembole dokununca lazim.
 *   Modul deseni ötekilerle aynı (cark.js, deri_cizim.js): ilk cizimde
 *   inmiyor, moodYukle() ile istek uzerine cekiliyor. Gelmemisse
 *   alienSec() sessizce eski ALIEN'e duser -- zararsiz (bkz. index.html
 *   moodYukle/alienSec).
 *
 * SAYFADAN KULLANILANLAR
 *   AILELER, aileSec, cal, beyazListe, sesBaglamiAl, actx, AYAR, tik,
 *   _secildi, _yut, ALIEN (yalnizca yorumda anilir), _moodKilitliYuva
 *   (dokunulan yuvayi bekleGoster/bekleDondur'a bildiren tek-gecislik
 *   kilit -- bkz. index.html moodAktifMi tanimindaki not).
 */

  /* ── SEMBOL SETI GENISLETILDI (18 Eylul) ─────────────────────────────
     Kullanicinin sozu: "eski sembollerim de olsun. sekli garip
     anlasilmayan seyleri cikar" -- ekran goruntusuyle isaret ettigi
     PIYANO (kutu+cizgi, kapi/tarak gibi okunuyordu), SAKSAFON ve BLUES
     (ikisi de asma kilit gibi okunuyordu, birbirinden ayirt edilemiyordu)
     ve ORKESTRA (dalgali blob, hicbir seye benzemiyordu) KALDIRILDI --
     o 4 kategorinin istasyon havuzu artik mood dokunusundan erisilmiyor
     (istasyonlarin kendisi radyo.json'da duruyor, normal gezinmeden hala
     bulunabilirler). Kalan 11 kategorinin GERCEK istasyon havuzuna
     (MOOD_ISTASYON) DOKUNULMADI. "30 tane olsun semboller" istegi ve
     "sembol cagristirmali olsun, bir sembolun 10 ayri duyguyu/eylemi
     temsil edebilir" sozu geregi: her kategori artik 2-3 GORSEL VARYANT
     tasiyor (ayni kategoriye birden fazla index isaret ediyor) -- 11
     kategori x ortalama ~2.7 varyant = 30 ikon. MOOD_SEMBOL bu yuzden
     kategori adini TEKRAR EDIYOR (index 0-2 hepsi 'AGAC' gibi);
     moodSembolSec() zaten MOOD_SEMBOL[index] -> MOOD_ISTASYON[ad] seklinde
     calisiyor, tekrarlanan ad ayni havuzu bulur -- baska hicbir kod
     degismedi (index.html'e hic dokunulmadi). */
  const MOOD_SEMBOL = ['AGAC','AGAC','AGAC','PIRAMIT','PIRAMIT','LOUNGE','LOUNGE','LOUNGE','KULAKLIK','KULAKLIK','KULAKLIK','SALSA','SALSA','UZAY','UZAY','UZAY','SENTEZ','SENTEZ','SENTEZ','DANS','DANS','DANS','FUNK','FUNK','FUNK','METAL','METAL','REGGAE','REGGAE','REGGAE'];
  /* İKINCI TUR (18 Eylul, ayni gun): "mum, koltuk, kuyruklu yildiz,
     maraka(eski)" da cikarildi, yerine "tv, sandalye, kalem, masa,
     kedi, kopek" kondu -- ayni "cagristirmali olsun, kategoriyle
     birebir eslesmesi sart degil" ilkesiyle (kullanicinin sozu: "her
     sembol 10 ayri duygu durumu ve cesitli istasyon... isimler yanlis
     sakin onlara bakma"). Kategori-index eslesmesi (MOOD_SEMBOL)
     DEGISMEDI, yalnizca bu dizideki cizimler yer degistirdi. */
  /* OLCUM (18 Eylul, uygulamanin GERCEK #bekle .yuva svg CSS'iyle --
     stroke:currentColor, fill:none, dinamik getBBox() viewBox --
     Chromium'da canli render alinip 30 ikon tek tek goruntuyle
     karsilastirildi): index 0 (ilk AGAC varyanti) cam agaci degil,
     asagi bakan bir ok gibi cikiyordu -- 6 noktali yol yanlis
     kurulmustu. Duzeltme: index 2'deki (orman) orta agacin ayni,
     kanitlanmis cizim deseni (govde + 2 katli govde-ucgen) buyutulup
     tek basina kullanildi. Duzeltmeden SONRA canli render'da duzgun
     bir cam agaci gorunuyor (bkz. render kaniti: onceki -> ok,
     sonraki -> agac). Digerlerinin hepsi (29/30) ilk denemede dogru
     cikti, tek sorun buydu. */
  const MOOD_IKON_LIST = [
    "<path d=\"M12 21V16.4\"/><path d=\"M12 16.4L7.6 16.4L12 9.4L9.2 9.4L12 4L14.8 9.4L12 9.4L16.4 16.4Z\"/>",
    "<path d=\"M12 4.4C8.2 4.4 5.6 7.4 6.4 10.6C4.6 11.2 4 13.6 5.6 15C5 17 6.6 19 9 18.6C9.6 20.2 14.4 20.2 15 18.6C17.4 19 19 17 18.4 15C20 13.6 19.4 11.2 17.6 10.6C18.4 7.4 15.8 4.4 12 4.4Z\"/><path d=\"M12 18.8V21.6\"/>",
    "<path d=\"M6.4 21 V18 M6.4 18 L3.6 18 L6.4 13 L4.4 13 L6.4 9 L8.4 13 L6.4 13 L9.2 18 Z\"/><path d=\"M17.6 21 V19 M17.6 19 L15 19 L17.6 14.6 L15.8 14.6 L17.6 11 L19.4 14.6 L17.6 14.6 L20.2 19 Z\"/><path d=\"M12 21 V16.8 M12 16.8 L8.6 16.8 L12 10.6 L9.8 10.6 L12 6 L14.2 10.6 L12 10.6 L15.4 16.8 Z\"/>",
    "<path d=\"M12 4 L21 19H3Z\"/><path d=\"M7.5 19 L12 11 L16.5 19\"/>",
    "<circle cx=\"12\" cy=\"5\" r=\"2.6\"/><path d=\"M12 7.6 V14.4 M8.4 20.6 L12 14.4 L15.6 20.6 M7.6 10.4 H16.4\"/>",
    "<path d=\"M5 4H19L12 12L5 4Z\"/><path d=\"M12 12V19M8 19H16\"/>",
    "<rect x=\"3.4\" y=\"5.4\" width=\"17.2\" height=\"12\" rx=\"1.4\"/><path d=\"M9 20.6H15M12 17.4V20.6\"/>",
    "<path d=\"M7.6 3.6V13.6\"/><path d=\"M7.6 13.6H16.4V16.2H7.6Z\"/><path d=\"M8.4 16.2V20.6M15.6 16.2V20.6\"/>",
    "<path d=\"M4 14V12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12V14\"/><rect x=\"2.6\" y=\"13\" width=\"4\" height=\"6\" rx=\"1.4\"/><rect x=\"17.4\" y=\"13\" width=\"4\" height=\"6\" rx=\"1.4\"/>",
    "<circle cx=\"12\" cy=\"12\" r=\"8\"/>",
    "<path d=\"M15.4 3.8 A8.2 8.2 0 1 0 15.4 20.2 A9.6 9.6 0 0 1 15.4 3.8Z\"/>",
    "<circle cx=\"6\" cy=\"7\" r=\"1.8\"/><path d=\"M6 9.2V14.4M4 20L6 14.4L8 20M4.4 11.6H7.6\"/><circle cx=\"18\" cy=\"7\" r=\"1.8\"/><path d=\"M18 9.2V14.4M16 20L18 14.4L20 20M16.4 11.6H19.6\"/><circle cx=\"12\" cy=\"5\" r=\"2\"/><path d=\"M12 7.2V13.6M9.6 20L12 13.6L14.4 20M9.8 10.4H14.2\"/>",
    "<path d=\"M4.6 19.4L15.4 4.6C16.2 3.5 17.8 3.4 18.8 4.4C19.8 5.4 19.7 7 18.6 7.8L7.8 19.4L4 20.6Z\"/><path d=\"M14 6.6L17.4 9\"/>",
    "<circle cx=\"12\" cy=\"12\" r=\"4.6\"/><ellipse cx=\"12\" cy=\"12\" rx=\"9.4\" ry=\"3\" transform=\"rotate(-20 12 12)\"/>",
    "<path d=\"M12 12 C12 10.5 13.2 9.4 14.6 9.6 C16.6 9.9 17.8 12 17.2 14 C16.4 16.6 13.6 17.8 11 16.8 C7.8 15.6 6.4 12 7.8 9 C9.6 5.2 14.4 3.8 18 6\"/>",
    "<path d=\"M3.6 8.4H20.4V10.4H3.6Z\"/><path d=\"M6 10.4V20.6M18 10.4V20.6\"/>",
    "<path d=\"M3 12H7L9 6L14 18L16 12H21\"/>",
    "<path d=\"M3.6 8 L7.2 4.4 L10.8 8 L14.4 4.4 L18 8 L20.4 5.6\"/><path d=\"M3.6 16 L7.2 12.4 L10.8 16 L14.4 12.4 L18 16 L20.4 13.6\"/>",
    "<path d=\"M17.6 4.4 C13 4.4 8.8 8.6 8.8 14.4 C8.8 17 10.4 19 12.8 19.4 C12.8 16.4 12.8 12 17.6 4.4Z\"/><path d=\"M12.8 19.4 L6 21.6\"/><path d=\"M11 9.6 L14.6 8.4 M10.2 12.6 L14.2 11.2 M9.8 15.6 L13.4 14.4\"/>",
    "<circle cx=\"12\" cy=\"11\" r=\"6.4\"/><path d=\"M12 4.6V17.4M5.6 11H18.4M7.5 6.5L16.5 15.5M16.5 6.5L7.5 15.5\"/><path d=\"M12 17.4V20\"/>",
    "<path d=\"M12 3.4 L14.4 9.8 L21.2 10.2 L15.8 14.4 L17.8 21 L12 17 L6.2 21 L8.2 14.4 L2.8 10.2 L9.6 9.8Z\"/>",
    "<path d=\"M6.4 20.6V12C6.4 8.4 8.8 6 12 6C15.2 6 17.6 8.4 17.6 12V20.6\"/><path d=\"M6.4 12L4 7.6L8.4 9.6M17.6 12L20 7.6L15.6 9.6\"/><path d=\"M9.4 15.4V16.2M14.6 15.4V16.2\"/><path d=\"M9.8 18.2C10.8 19 13.2 19 14.2 18.2\"/>",
    "<circle cx=\"12\" cy=\"12\" r=\"8.4\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\"/><circle cx=\"12\" cy=\"12\" r=\"0.8\" fill=\"currentColor\" stroke=\"none\"/>",
    "<path d=\"M7.4 13.6 A3.6 3.6 0 0 1 8 6.6 A4.8 4.8 0 0 1 17 8.2 A3 3 0 0 1 16.6 13.6Z\"/><path d=\"M8.6 16.4 L7.6 19.6 M12 16.4 L11 19.6 M15.4 16.4 L14.4 19.6\"/>",
    "<path d=\"M7 20.6V13C7 9 9.2 6.4 12 6.4C14.8 6.4 17 9 17 13V20.6\"/><path d=\"M7 12.4C5.2 12.4 4 14.2 4.4 16.4C4.8 18.4 6.4 19 7 17.8M17 12.4C18.8 12.4 20 14.2 19.6 16.4C19.2 18.4 17.6 19 17 17.8\"/><circle cx=\"9.6\" cy=\"14.4\" r=\"0.8\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"14.4\" cy=\"14.4\" r=\"0.8\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M11.2 16.8H12.8L12 18Z\" fill=\"currentColor\" stroke=\"none\"/>",
    "<path d=\"M13 3 L6 13H11L10 21L18 10H13Z\"/>",
    "<path d=\"M2.6 19.4 L9 8.6 L13.4 15 L16.4 10.8 L21.4 19.4Z\"/>",
    "<circle cx=\"12\" cy=\"12\" r=\"4.4\"/><path d=\"M12 3V5.4M12 18.6V21M3 12H5.4M18.6 12H21M5.9 5.9L7.6 7.6M16.4 16.4L18.1 18.1M5.9 18.1L7.6 16.4M16.4 7.6L18.1 5.9\"/>",
    "<path d=\"M2.6 9.4C5 6.6 7.6 6.6 10 9.4C12.4 12.2 15 12.2 17.4 9.4C18.6 8 19.8 7.4 21.4 7.4\"/><path d=\"M2.6 15C5 12.2 7.6 12.2 10 15C12.4 17.8 15 17.8 17.4 15C18.6 13.6 19.8 13 21.4 13\"/>",
    "<path d=\"M5 19C5 10 12 4 19 4C19 12 14 19 5 19Z\"/><path d=\"M6 18C10 14 13 10 17 6\"/>"
  ];
  const MOOD_ISTASYON = {
  /* Deger: radyo.json'daki gercek "id" alaninin "rb:" onekli UUID kismi.
     Once tam istasyon nesnesi (mp3+ad+grup+ulke) burada tekrar ediliyordu --
     "Ham boy < 1272 KB" testini ~54 KB asirdi (olculdu, 17 Eylul). O bilgi
     ZATEN beyazListe icinde (radyo.json'dan ayrica yukleniyor); burada
     yalnizca kimlik tutup calma anindan moodSembolSec() beyazListe icinde
     stationuuid ile arayip gercek mp3/ad/grup/ulke'yi oradan okuyor -- ayni
     istYildizKur()'un s.stationuuid -> id:'rb:'+... donusumu (bkz. orada). */
  AGAC: ["3f4be720-c996-439f-be3b-cce594ea2852","b828a184-3488-48f2-ab60-38a5e435a9fe","8492e24d-7908-4cc4-9ee7-c3d5475c42d7","44b7f191-9478-46b0-a3b5-5a0ea2b2d64e","6445c180-6a73-4e3f-834f-4ff6246d30fe","550f80dd-53b8-4139-939b-7e95f9e78b4b","4dad0ae3-720a-434e-b350-7186e4c5ea6f","95277bca-2c9a-4c08-b2e7-0854e5793f8e","77eaf32d-241f-4f25-b7d6-347783cd4471","bb7572df-2619-43fd-9ce1-c2a288671fe2","0e14eb3e-a217-421a-ba6a-133bf5c3f95b","87aa35fa-37b4-47bf-bb10-bceeb024a7d3","eca094c6-8bf7-46a7-a958-233e290272d4","ca0d4e4d-658b-43cc-abce-710075ae358d","2babf29a-811c-4a51-93c3-9f3531ef2e97","1665ae4c-74dc-44f0-bd0a-7a0d0291aa8c","750cbe31-150e-4cd2-8ec5-a6a8a9a7c8b2","22ed63fd-57bf-469a-9c71-4524834b74d0","70094073-a1a6-4c73-b871-6b25dddee813","8f14d1fa-31f6-4fd7-9dcb-8ed0e3bf3d18","49902d2d-672d-4130-b42a-90592d0460c5","03f081d4-4b70-46b2-b353-b47b502495b2","77871905-48cd-465c-8d25-dd14ae536656","0f89b1e4-ea1d-47e1-906b-7581691b6849","22b4735f-78fe-41db-bb98-800333352815","954a3105-c6df-452b-a70c-577cee41355a","c1484aa5-b758-47a1-b098-69db58d6fb78","9467b580-dd8b-44d6-b99a-6ac688a50786"],
  /* PIYANO, ORKESTRA, SAKSAFON, BLUES havuzlari 18 Eylul'de KALDIRILDI
     (bkz. MOOD_IKON_LIST ustundeki not -- o dort sembolun ciziminden
     kaynaklanan karisiklik). Istasyonlarin kendisi radyo.json'da duruyor,
     normal gezinmeden hala erisilebilirler -- yalnizca mood dokunusu
     kisayolundan cikarildilar. */
  LOUNGE: ["e1480c4f-467f-44ec-8b57-653abdfc7c7e","3f4be720-c996-439f-be3b-cce594ea2852","b828a184-3488-48f2-ab60-38a5e435a9fe","8492e24d-7908-4cc4-9ee7-c3d5475c42d7","44b7f191-9478-46b0-a3b5-5a0ea2b2d64e","6445c180-6a73-4e3f-834f-4ff6246d30fe","77eaf32d-241f-4f25-b7d6-347783cd4471","9d8cf601-dc3c-49be-89c2-019ec28726a9","960eb2e9-0601-11e8-ae97-52543be04c81","ca0d4e4d-658b-43cc-abce-710075ae358d","8e0f1ea7-495d-495e-9f49-1a320e2bc5d1","43d3984d-fd02-454e-b7a3-4d7ea82cea11","5143bb9a-3c5e-4c53-a6ec-0108435caf5a","1665ae4c-74dc-44f0-bd0a-7a0d0291aa8c","750cbe31-150e-4cd2-8ec5-a6a8a9a7c8b2","22ed63fd-57bf-469a-9c71-4524834b74d0","ef0f4fda-76d2-4fc1-88f0-8e150b0509bd","70094073-a1a6-4c73-b871-6b25dddee813","9fd6e036-c08b-49d3-a8b7-c8b282892ffe","8f14d1fa-31f6-4fd7-9dcb-8ed0e3bf3d18","49902d2d-672d-4130-b42a-90592d0460c5","03f081d4-4b70-46b2-b353-b47b502495b2","77871905-48cd-465c-8d25-dd14ae536656","9637f981-0601-11e8-ae97-52543be04c81","64381ada-fe89-46eb-8049-b1fc79e4dbbe","02569932-0b3c-4938-9d3e-b00b2158d40b","a1e34b61-f532-4308-b2b9-b44c69f8507d","0f89b1e4-ea1d-47e1-906b-7581691b6849"],
  KULAKLIK: ["2bcc90cc-55d3-4852-8644-6df52d642bef","0e14eb3e-a217-421a-ba6a-133bf5c3f95b","d5468df4-e6d0-11e9-a96c-52543be04c81","07e6c4b7-b1b5-430b-a7a8-166260a775ee","0c7c0c0c-5981-440f-bc8a-98530962c191","dd514cb7-fca6-427a-add8-bcf5892b6c3d","79839c1c-bfb8-40a4-aed7-f31191cbd015","43d3984d-fd02-454e-b7a3-4d7ea82cea11","5143bb9a-3c5e-4c53-a6ec-0108435caf5a","6816e8cd-8b06-4d68-b61f-4d9f54015f95","a5331ae6-1196-46c4-b8d6-6a013018bbfe","9f3d4c02-c3f0-4f00-bebe-509ff81b4d54","04963e61-76f5-411c-9fed-2a3b08f9054d","b29a1971-9369-4b82-a0b7-a5115d55712f","26bcf620-4738-4778-acec-e64d19b4335f","2c274ca7-ad5e-44f1-9ec3-daec5452bea6","22ed63fd-57bf-469a-9c71-4524834b74d0","ef0f4fda-76d2-4fc1-88f0-8e150b0509bd","70094073-a1a6-4c73-b871-6b25dddee813","9fd6e036-c08b-49d3-a8b7-c8b282892ffe","8f14d1fa-31f6-4fd7-9dcb-8ed0e3bf3d18","49902d2d-672d-4130-b42a-90592d0460c5","03f081d4-4b70-46b2-b353-b47b502495b2","77871905-48cd-465c-8d25-dd14ae536656","9637f981-0601-11e8-ae97-52543be04c81","64381ada-fe89-46eb-8049-b1fc79e4dbbe","02569932-0b3c-4938-9d3e-b00b2158d40b","a1e34b61-f532-4308-b2b9-b44c69f8507d"],
  PIRAMIT: ["0730a3ce-73e4-4f39-b60c-ffeaa6ee1f1b","c21d3998-f91b-48e4-9bb1-74fa12ffb9e5","038c8fb4-6939-11e9-af37-52543be04c81","8aaf1e64-f9eb-46f5-9844-2da720f9f83f","1d86737b-bf6f-41f2-bd52-cd29d4a73688","78363b80-d1dd-4a4c-9087-6ed976878360","d4f41697-61c8-4cd5-bcd3-93c0d5248a84","8c45fcc8-a9fe-4e07-9a53-67b6a2a1fc76","42c0308b-908d-4243-92e5-05d658ecb781","bc97d762-e996-44da-93f6-5769cadd2059","f99eb819-ce65-47c9-9f08-580254a5c8f5","4bd0c575-f6ae-46b0-8efb-3267b9cb211c","12f45ca4-3d96-4937-85e0-a424d36a4d09","960dd7a5-0601-11e8-ae97-52543be04c81","0f790e00-fd3b-431f-9b7e-047fac185cdb","4a116b98-e289-4630-9b62-b93a67159c7e","61f28b98-91ee-476b-9863-099b2aa58d10","a1dbd7d6-d0c7-4479-b91e-e44b64718d65","a96e06f8-4d64-11ea-b877-52543be04c81","39e5d255-c3ad-4f81-9957-a1ceb59a3488","e9fddd49-3ee2-4597-8574-1b7dbd00aac0","5ff66832-e6b3-486b-bac8-e00ca29b6f67","3af5df1b-a5c9-4931-a732-a235c7ba2014","58940095-dc8b-477f-a7e1-cbac01932f5c","5fc794f4-46d3-4d09-aa96-99efaa85d470","5bfc4b1a-def1-44ab-8d6d-e7c63820f781","3aa2641c-45aa-4ee8-b1e2-1b397fac47e5","47cea623-5cb5-11e9-a622-52543be04c81"],
  SALSA: ["ade78f50-e134-4d3c-95ab-8bc9cccc431c","c7d6315c-3bcd-40f6-a1b5-4bc1c8efecee","01adaafa-0ad7-4813-9427-add061d78b91","f94514ec-c316-4d21-bd27-b7f0e8e1944b","839c6307-7d21-4d18-962f-ecf96f991072","dcbe74d8-302f-47a1-a030-38f071daf479","659f5596-51a8-4e3a-802e-ef5e6ceb61d0","4ef0947a-e689-449b-85d4-c4813ccba425","1e586ac9-e78b-4522-b7ad-5cbf483257d1","8e5e5550-280a-4a6f-a5c1-5e0805c3a7e9","6f022fbe-c202-4c7d-bd6c-b14953f9163a","95adc04f-2a0d-4ae4-b3ce-572c8ace6513","0534207e-dea1-4239-a4be-d38017df2e61","0c6bfd10-3912-4ef0-babc-e2ca4dd16881","5ee5f635-4e06-4040-b684-bd3287aaeea5","23ba8ca4-e08b-41d3-a824-bc7688613434","2730de1b-dcd9-41aa-adcb-ff202d4cad22","81d58170-2f06-47fb-be37-e6c638f09bdf","d2830deb-5658-4405-a1e5-c35437d97527","a1c99f81-f8d1-4f6d-b9e3-714763a72b7d","48b996bb-aedd-4776-b088-49c67e581121","a3253a96-a1ba-4cf5-bf4b-ec7988afcfd3","12a970e2-443a-4640-8775-5c6b0f238c4a","6d4127ba-cd83-45c2-90ad-57dfd90b1457","25bf9ae3-16f1-4ffa-8651-b67e1ba22d64","2a5fdf2a-63fe-4542-8f9b-2ad4ee1f1eff","f3e53c0b-bae2-4c77-8214-4f0614a72a70","84b28072-96f5-4397-97e2-9655fa9c5d85"],
  UZAY: ["3f4be720-c996-439f-be3b-cce594ea2852","b828a184-3488-48f2-ab60-38a5e435a9fe","8492e24d-7908-4cc4-9ee7-c3d5475c42d7","d2827087-cab4-48fb-a6f0-7e1a2b16422e","44b7f191-9478-46b0-a3b5-5a0ea2b2d64e","6445c180-6a73-4e3f-834f-4ff6246d30fe","1dda6ddb-db9c-4b4f-ac89-b337dc5af20f","8a6c3d9a-1203-45c9-800b-435789d9c616","2bcc90cc-55d3-4852-8644-6df52d642bef","9211a090-f78c-48e8-b5bf-3f0bf27f5bf2","550f80dd-53b8-4139-939b-7e95f9e78b4b","c19e39ff-a86f-4d55-a4c1-55e9d791f59a","4dad0ae3-720a-434e-b350-7186e4c5ea6f","95277bca-2c9a-4c08-b2e7-0854e5793f8e","77eaf32d-241f-4f25-b7d6-347783cd4471","bb7572df-2619-43fd-9ce1-c2a288671fe2","0e14eb3e-a217-421a-ba6a-133bf5c3f95b","87aa35fa-37b4-47bf-bb10-bceeb024a7d3","9d8cf601-dc3c-49be-89c2-019ec28726a9","eca094c6-8bf7-46a7-a958-233e290272d4","d5468df4-e6d0-11e9-a96c-52543be04c81","a807ecc5-8410-4704-bac4-aed64ba76742","960eb2e9-0601-11e8-ae97-52543be04c81","ca0d4e4d-658b-43cc-abce-710075ae358d","9614eb15-0601-11e8-ae97-52543be04c81","05d929e4-1281-416e-9db5-17e79df91dc3","83accca7-b878-419d-a506-3d21ef2f250f","2ed5037f-f09d-4aa6-b9b9-57024ecbb8a4"],
  SENTEZ: ["d2827087-cab4-48fb-a6f0-7e1a2b16422e","44b7f191-9478-46b0-a3b5-5a0ea2b2d64e","c19e39ff-a86f-4d55-a4c1-55e9d791f59a","ca0d4e4d-658b-43cc-abce-710075ae358d","038c8fb4-6939-11e9-af37-52543be04c81","61a0c6db-e038-4d58-8977-1e9e90ef5e8f","df1b947f-d1b1-4483-a078-402570a812f3","ef0f4fda-76d2-4fc1-88f0-8e150b0509bd","005d4865-d4a4-42bf-a4dd-a8127d9c59c5","db35a186-97bf-447f-8f23-b3724ec63e6b","184e39db-422d-4f57-aff9-548af086f160","bbe3fd37-8cff-44e4-8818-4f6c28df93d7","6cf9cad4-ef5a-4abc-8802-a2f112ca751d","c495e9f2-0ba7-4b33-be25-cb643defddfd","954a3105-c6df-452b-a70c-577cee41355a","60ede1ca-d7fa-4a36-a047-aec873b9be41","7035cee7-7868-4cc2-99c9-6f3e365836ea","c6832a91-9bec-4c7c-a9d3-6567a3ec1acc","282facce-8ae7-46a5-9e24-a946abe9fc7d","fd57ae03-5547-4d41-9540-33059a7a42c5","a7760c28-7212-4155-9610-21fea3bcd5e0","b7126702-9470-4eb5-99a5-11b8d00abf15","85e0f258-1f07-4dcb-a776-20287579d460","6affdd69-650a-46a9-94bf-cff80541e152","5fc794f4-46d3-4d09-aa96-99efaa85d470","0535aa58-3be6-47d9-8b93-ac405e957f21","465e8c27-0340-4e2b-a067-3319f55cdbff","a1c99f81-f8d1-4f6d-b9e3-714763a72b7d"],
  DANS: ["e1480c4f-467f-44ec-8b57-653abdfc7c7e","652a2fa1-d3fe-4724-a3eb-3d6b7fb1e687","32fed468-cfe3-11e9-a861-52543be04c81","038c8fb4-6939-11e9-af37-52543be04c81","2c274ca7-ad5e-44f1-9ec3-daec5452bea6","78363b80-d1dd-4a4c-9087-6ed976878360","df1b947f-d1b1-4483-a078-402570a812f3","b421583d-b66d-49da-8980-f912448af8a7","40694d2e-2fd1-435f-b672-299a8587a49f","8c45fcc8-a9fe-4e07-9a53-67b6a2a1fc76","53548d01-14fa-4c90-92c5-8a13ce0ae0fd","88a2899f-a42f-43ed-b2bc-6d5e40b8131c","110ae9c2-a80a-45fe-93fc-c4662ad3ab27","0653bfab-cb60-44e9-9511-d89b993c48f9","0df2b943-49bb-4843-9f07-c73f0fa30e50","47f4b8f2-a516-4763-b597-36622e573838","8dc26fca-2006-4960-b493-5f9ee020bf0d","4d4286f4-d818-4f06-82e0-7eecf834de1a","f99eb819-ce65-47c9-9f08-580254a5c8f5","4dca42c7-eb1e-4471-a886-0f8c51a9806c","b7e57990-b3ad-44a9-9458-2f8f58dcbde2","6623c04a-8c8d-4ef7-aa6a-d14361fbb0be","ef0f4fda-76d2-4fc1-88f0-8e150b0509bd","005d4865-d4a4-42bf-a4dd-a8127d9c59c5","df2ef0fb-5019-4eb0-bfea-fa21e6a7e609","f9533da3-f2c1-11e8-a471-52543be04c81","4cc3e959-b572-4285-99e2-069151d03b5e","a36cb1a5-f9b5-4739-a86a-987d256b7d0e"],
  FUNK: ["9d8cf601-dc3c-49be-89c2-019ec28726a9","ca0d4e4d-658b-43cc-abce-710075ae358d","a03d0d90-73ec-451d-bb7e-b698f9b3698e","8aaf1e64-f9eb-46f5-9844-2da720f9f83f","b421583d-b66d-49da-8980-f912448af8a7","40694d2e-2fd1-435f-b672-299a8587a49f","8c45fcc8-a9fe-4e07-9a53-67b6a2a1fc76","53548d01-14fa-4c90-92c5-8a13ce0ae0fd","0653bfab-cb60-44e9-9511-d89b993c48f9","4d4286f4-d818-4f06-82e0-7eecf834de1a","fba3d98e-87bd-4ad5-98d0-2fdb6970a1c0","954a3105-c6df-452b-a70c-577cee41355a","9f0466be-b6b0-4f7c-baff-f64555494804","9467b580-dd8b-44d6-b99a-6ac688a50786","df2ef0fb-5019-4eb0-bfea-fa21e6a7e609","f9533da3-f2c1-11e8-a471-52543be04c81","a08f5f5a-b392-4615-b0f4-c0fb43575a60","7afae7e3-8d06-42f5-b59e-a52d6e09e60e","9cd294c5-180a-45c4-bf87-d80e77960d78","3998f9ae-ed80-4319-8109-0acb29efb256","6affdd69-650a-46a9-94bf-cff80541e152","f215e3f4-6f2b-4279-98e6-7c304a159fa7","bd78ca13-a5ed-4a0d-ad43-5408434e18d6","6d4127ba-cd83-45c2-90ad-57dfd90b1457","b455fce7-a75a-4ea4-b08b-ea5e6444392d","ed39bcfe-7256-46a6-a9d2-5529605946b5","3648af4c-a9bd-4852-9d25-2e18f962fbde","e6c5d27f-362c-48a9-8eb9-9dcc902b9bfe"],
  METAL: ["1dda6ddb-db9c-4b4f-ac89-b337dc5af20f","ea537888-17c8-461b-b41b-5e9cee913e44","652a2fa1-d3fe-4724-a3eb-3d6b7fb1e687","32fed468-cfe3-11e9-a861-52543be04c81","038c8fb4-6939-11e9-af37-52543be04c81","ca2d0aa2-6fc8-4761-beb6-ce692a4a9bf5","64f0a21e-1f0f-4f3b-a903-1d4e872fa094","2c274ca7-ad5e-44f1-9ec3-daec5452bea6","08429f60-383a-46ee-9bdf-03b442aab240","78363b80-d1dd-4a4c-9087-6ed976878360","d4f41697-61c8-4cd5-bcd3-93c0d5248a84","33798616-837b-4418-935d-4f947562ddb8","69cdf0f5-ed69-4bf2-be17-719a17c5681f","70133397-5845-4524-bcda-701da75f46fa","40694d2e-2fd1-435f-b672-299a8587a49f","8a18c2ff-bdb9-4bfc-9707-091c12086fea","8c45fcc8-a9fe-4e07-9a53-67b6a2a1fc76","42c0308b-908d-4243-92e5-05d658ecb781","694bc694-cd35-4224-b622-630b735af327","88a2899f-a42f-43ed-b2bc-6d5e40b8131c","110ae9c2-a80a-45fe-93fc-c4662ad3ab27","0df2b943-49bb-4843-9f07-c73f0fa30e50","2ed9fe39-62df-4484-9473-24c0621a5de8","98a2bd0a-a207-4c3c-b273-df0a0dba20dc","47f4b8f2-a516-4763-b597-36622e573838","8dc26fca-2006-4960-b493-5f9ee020bf0d","afe8da7e-5b5f-463d-8e34-2e264a07dbb6","4bd0c575-f6ae-46b0-8efb-3267b9cb211c"],
  REGGAE: ["40694d2e-2fd1-435f-b672-299a8587a49f","8c45fcc8-a9fe-4e07-9a53-67b6a2a1fc76","e84c98aa-761a-42ec-acb5-cd20fbb8f0cb","43ea0516-a17e-4b65-8999-61791c800ca6","fba3d98e-87bd-4ad5-98d0-2fdb6970a1c0","77871905-48cd-465c-8d25-dd14ae536656","a7760c28-7212-4155-9610-21fea3bcd5e0","db695122-b64f-4be3-a2b6-633e8722d4ba","1e586ac9-e78b-4522-b7ad-5cbf483257d1","8db50028-caf7-4a39-a70b-2b71500560f6","c0dccbae-c3c0-4d19-b82c-d6803c4cc045","6984559c-32fa-47e8-ae3e-781070a5765a","bf16cbc0-164f-4736-bc61-0ffa1c988f47","e49f5776-8aea-4db8-ba6e-4b12b262d4ab","a1c99f81-f8d1-4f6d-b9e3-714763a72b7d","cef8689a-a858-4400-aaaf-f6e57a633836","631e9ffd-0dcf-4f60-8e9a-002889792757","a3253a96-a1ba-4cf5-bf4b-ec7988afcfd3","f48ce4f1-3f31-11e8-b74d-52543be04c81","960eb3a4-0601-11e8-ae97-52543be04c81","f4dee6f0-22a3-11ea-aa0c-52543be04c81","701106b9-59e3-11ea-be63-52543be04c81","2a2eeadb-3126-4048-b8f1-383c7f98c956","4b14986a-9f8c-422f-a78f-4fe28363e950","3511172e-a0f1-4568-9d34-87c3ef0fa608","0e3c61c0-3980-4848-8ae6-ff68d550a5f6","13acd5a9-d83b-4689-9853-0351c905590f","1a29a057-1127-4906-b93e-dd2a7bdb57bf"]
};

  function moodSembolSec(yuv){
    try{
      const anahtar = String((yuv && yuv.dataset && yuv.dataset.sem) || '');
      if(!anahtar.startsWith('M')) return;               // henuz mood ikonu oturmadi
      const semAdi = MOOD_SEMBOL[parseInt(anahtar.slice(1), 10)];
      const idler = semAdi && MOOD_ISTASYON[semAdi];
      /* MOOD_ISTASYON artik yalnizca stationuuid tutuyor (bkz. tanimin
         ustundeki not, 17 Eylul boyut duzeltmesi) -- gercek istasyon
         (mp3/ad/grup/ulke) beyazListe'den okunuyor, TIPKI
         istYildizKur()'un s.stationuuid -> id:'rb:'+... donusumu gibi.
         beyazListe henuz yoksa (ag) sessizce vazgeciliyor -- zaten
         radyo modunda bir sey caliyorsa liste kesin yuklenmis olur. */
      if(!idler || !idler.length || !beyazListe || !beyazListe.length) return;
      const havuz = beyazListe.filter(s => idler.indexOf(s.stationuuid) !== -1);
      if(!havuz.length) return;
      const s = havuz[Math.random()*havuz.length|0];
      const ist = { id:'rb:'+s.stationuuid, mp3:(s.url_resolved||s.url), ad:(s.name||'radio'),
                    grup:(s.grup||''), ulke:(s.ulke||'') };
      try{ sesBaglamiAl(); if(actx) actx.resume(); }catch(_){ _yut(_); }
      try{ if(AYAR.tikSes && typeof tik === 'function') tik(); }catch(_){ _yut(_); }
      if(ist.grup && typeof aileSec === 'function'){ try{ aileSec(ist.grup, true); }catch(e){ _yut(e); } }
      _secildi = true;
      /* DOKUNULAN YUVA BU GECIS BOYUNCA SABIT KALSIN (18 Eylul, ikinci
         duzeltme): index.html'deki _moodKilitliYuva'ya yaziyoruz --
         cal()'in tetikledigi bekleGoster()/bekleDondur() bu YUVAYI
         atlayip digger ikisini her zamanki gibi donduruyor. Kilit
         TEK GECISLIK: bekleDondur() kendi icinde tuketip sifirliyor,
         bir sonraki istasyon gecisinde (mood dokunusu olsun olmasin)
         uc yuva da yeniden serbest kalir. */
      try{ _moodKilitliYuva = yuv; }catch(_){ _yut(_); }
      cal({ id:ist.id, mp3:ist.mp3, ad:ist.ad, sanatci:'', radyo:true, grup:ist.grup, ulke:ist.ulke });
      moodVurgula(yuv, ist.grup);
    }catch(e){ _yut(e); }
  }
  /* Basilan yuva, secilen istasyonun kendi tur rengini alir (AILELER'
     deki gercek renk -- uydurma degil).
     KALICI (18 Eylul, ikinci istek -- ilkinde 1400 ms'de sonuyordu,
     "bir sonraki dokunusa kadar kalici olsun" sozuyle degisti):
     burada artik bir sonme yok, renk BIR SONRAKI DOKUNUSA/GECISE
     kadar duruyor. Sonme sorumlulugu buradan degil, index.html'deki
     yuvaYaz()'dan geliyor -- her yeni cizimde (sembol degisince) o
     yuvanin mood-sec'i ve --mood-renk'i siliniyor, yani BASKA bir
     ikon o yuvaya yazilir yazilmaz eski renk otomatik gider. Bu yuva
     _moodKilitliYuva sayesinde zaten BU ISTASYON GECISI TAMAMEN
     oturana kadar (bekleDondur bitene kadar) yeniden yazilmiyor, o
     yuzden renk EN AZ o kadar kesin kalir; sonrasinda (yeni bir
     dokunus ya da normal donme) yuvaYaz calisinca kendiliginden
     kalkiyor. */
  function moodVurgula(yuv, grup){
    try{
      const aile = (typeof AILELER !== 'undefined' ? AILELER : []).find(a=>a.ad===grup);
      if(aile && aile.renk){ yuv.style.setProperty('--mood-renk', 'rgb(' + aile.renk + ')'); }
      yuv.classList.add('mood-sec');
    }catch(e){ _yut(e); }
  }

try{ window.MOOD_HAZIR = true; }catch(e){}

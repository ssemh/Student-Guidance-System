document.addEventListener('DOMContentLoaded', function() {

    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!isLoggedIn || !currentUser) {
        window.location.href = 'giris.html';
        return;
    }


    const tytTarih = new Date('2025-06-21T10:15:00');
    const aytTarih = new Date('2025-06-22T10:15:00');
    let tytInterval;
    let aytInterval;

    function kalanSureyiGuncelle(hedefTarih, gosterge) {
        const simdi = new Date();
        const fark = hedefTarih - simdi;

        const daysElement = gosterge.querySelector('.days');
        const hoursElement = gosterge.querySelector('.hours');
        const minutesElement = gosterge.querySelector('.minutes');
        const secondsElement = gosterge.querySelector('.seconds');

        if (!daysElement || !hoursElement || !minutesElement || !secondsElement) return false; // Elements not found

        if (fark <= 0) {
            daysElement.textContent = '0';
            hoursElement.textContent = '0';
            minutesElement.textContent = '0';
            secondsElement.textContent = '0';
            return false;
        }

        const gun = Math.floor(fark / (1000 * 60 * 60 * 24));
        const saat = Math.floor((fark % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const dakika = Math.floor((fark % (1000 * 60 * 60)) / (1000 * 60));
        const saniye = Math.floor((fark % (1000 * 60)) / 1000);

        daysElement.textContent = gun;
        hoursElement.textContent = saat;
        minutesElement.textContent = dakika;
        secondsElement.textContent = saniye;
        return true;
    }

    const tytGosterge = document.getElementById('tyt-zaman');
    const aytGosterge = document.getElementById('ayt-zaman');

    function tytGuncelle() {
        kalanSureyiGuncelle(tytTarih, tytGosterge);
    }

    function aytGuncelle() {
        kalanSureyiGuncelle(aytTarih, aytGosterge);
    }


    tytGuncelle();
    aytGuncelle();


    const secimBtnler = document.querySelectorAll('.secim-btn');
    const paneller = document.querySelectorAll('.sayac-panel');

    secimBtnler.forEach(btn => {
        btn.addEventListener('click', () => {
            secimBtnler.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const hedef = btn.dataset.target;
            paneller.forEach(panel => {
                panel.classList.add('hidden');
                if (panel.id === hedef + '-panel') {
                    panel.classList.remove('hidden');
                }
            });


            if (hedef === 'tyt') {
                clearInterval(aytInterval);
                tytInterval = setInterval(tytGuncelle, 1000);
            } else if (hedef === 'ayt') {
                clearInterval(tytInterval);
                aytInterval = setInterval(aytGuncelle, 1000);
            } else {
                clearInterval(tytInterval);
                clearInterval(aytInterval);
            }
        });
    });


    let kronometreCalisiyor = false;
    let kronometreBaslangic = 0;
    let kronometreInterval;
    const kronometreGosterge = document.getElementById('kronometre-zaman');

    document.getElementById('kronometre-baslat').addEventListener('click', function() {
        if (!kronometreCalisiyor) {
            kronometreCalisiyor = true;
            this.innerHTML = '<i class="fas fa-pause"></i> Durdur';
            kronometreBaslangic = Date.now() - (kronometreBaslangic || 0);
            kronometreInterval = setInterval(kronometreGuncelle, 10);
        } else {
            kronometreCalisiyor = false;
            this.innerHTML = '<i class="fas fa-play"></i> Başlat';
            clearInterval(kronometreInterval);
            kronometreBaslangic = Date.now() - kronometreBaslangic;
        }
    });

    document.getElementById('kronometre-sifirla').addEventListener('click', function() {
        kronometreCalisiyor = false;
        document.getElementById('kronometre-baslat').innerHTML = '<i class="fas fa-play"></i> Başlat';
        clearInterval(kronometreInterval);
        kronometreBaslangic = 0;
        updateTimeUnit(kronometreGosterge, '.hours', 0);
        updateTimeUnit(kronometreGosterge, '.minutes', 0);
        updateTimeUnit(kronometreGosterge, '.seconds', 0);
    });

    function kronometreGuncelle() {
        const gecenSure = Date.now() - kronometreBaslangic;
        const saat = Math.floor(gecenSure / 3600000);
        const dakika = Math.floor((gecenSure % 3600000) / 60000);
        const saniye = Math.floor((gecenSure % 60000) / 1000);
        
        updateTimeUnit(kronometreGosterge, '.hours', saat);
        updateTimeUnit(kronometreGosterge, '.minutes', dakika);
        updateTimeUnit(kronometreGosterge, '.seconds', saniye);
    }


    function updateTimeUnit(gostergeElement, selector, value) {
        const unitElement = gostergeElement.querySelector(selector);
        if (unitElement) {
            unitElement.textContent = value.toString().padStart(2, '0');
        }
    }


    let tytDenemeSuresi = 165 * 60;
    let aytDenemeSuresi = 180 * 60;
    let tytDenemeInterval;
    let aytDenemeInterval;
    let tytDenemeCalisiyor = false;
    let aytDenemeCalisiyor = false;
    const tytDenemeGosterge = document.getElementById('tyt-deneme-zaman');
    const aytDenemeGosterge = document.getElementById('ayt-deneme-zaman');
    const alarmSesi = document.getElementById('alarm-sesi');

    function denemeSuresiGuncelle(kalanSure, gostergeElement) {
        const dakika = Math.floor(kalanSure / 60);
        const saniye = kalanSure % 60;
        updateTimeUnit(gostergeElement, '.minutes', dakika);
        updateTimeUnit(gostergeElement, '.seconds', saniye);
    }


    const sesSecici = document.getElementById('ses-secici');
    let ozelSes = null;


    function sesSec(timerId) {
        sesSecici.click();
        sesSecici.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                if (timerId === 'tyt-deneme' || timerId === 'ayt-deneme' || timerId === 'ozel') {
                    ozelSes = new Audio(url);
                }
                alert('Ses başarıyla değiştirildi!');
            }
        };
    }


    function sesCal(timerId) {
        if (timerId === 'tyt-deneme' || timerId === 'ayt-deneme' || timerId === 'ozel') {
            if (ozelSes) {
                ozelSes.play();
            } else {
                const alarmSesi = document.getElementById('alarm-sesi');
                alarmSesi.src = 'sound/Kayıt.mp3'; // Varsayılan ses dosyası
                alarmSesi.play();
            }
        }
    }


    document.getElementById('tyt-deneme-ses-sec').addEventListener('click', () => sesSec('tyt-deneme'));
    document.getElementById('ayt-deneme-ses-sec').addEventListener('click', () => sesSec('ayt-deneme'));
    document.getElementById('ozel-ses-sec').addEventListener('click', () => sesSec('ozel'));


    document.getElementById('tyt-deneme-baslat').addEventListener('click', function() {
        if (!tytDenemeCalisiyor) {
            tytDenemeCalisiyor = true;
            this.innerHTML = '<i class="fas fa-pause"></i> Durdur';
            tytDenemeInterval = setInterval(() => {
                if (tytDenemeSuresi > 0) {
                    tytDenemeSuresi--;
                    denemeSuresiGuncelle(tytDenemeSuresi, tytDenemeGosterge);
                } else {
                    clearInterval(tytDenemeInterval);
                    tytDenemeCalisiyor = false;
                    this.innerHTML = '<i class="fas fa-play"></i> Başlat';
                    sesCal('tyt-deneme');
                    alert('TYT Deneme süresi doldu!');
                }
            }, 1000);
        } else {
            clearInterval(tytDenemeInterval);
            tytDenemeCalisiyor = false;
            this.innerHTML = '<i class="fas fa-play"></i> Başlat';
        }
    });

    document.getElementById('tyt-deneme-sifirla').addEventListener('click', function() {
        clearInterval(tytDenemeInterval);
        tytDenemeSuresi = 165 * 60;
        tytDenemeCalisiyor = false;
        document.getElementById('tyt-deneme-baslat').innerHTML = '<i class="fas fa-play"></i> Başlat';
        denemeSuresiGuncelle(tytDenemeSuresi, tytDenemeGosterge);
    });


    document.getElementById('ayt-deneme-baslat').addEventListener('click', function() {
        if (!aytDenemeCalisiyor) {
            aytDenemeCalisiyor = true;
            this.innerHTML = '<i class="fas fa-pause"></i> Durdur';
            aytDenemeInterval = setInterval(() => {
                if (aytDenemeSuresi > 0) {
                    aytDenemeSuresi--;
                    denemeSuresiGuncelle(aytDenemeSuresi, aytDenemeGosterge);
                } else {
                    clearInterval(aytDenemeInterval);
                    aytDenemeCalisiyor = false;
                    this.innerHTML = '<i class="fas fa-play"></i> Başlat';
                    sesCal('ayt-deneme');
                    alert('AYT Deneme süresi doldu!');
                }
            }, 1000);
        } else {
            clearInterval(aytDenemeInterval);
            aytDenemeCalisiyor = false;
            this.innerHTML = '<i class="fas fa-play"></i> Başlat';
        }
    });

    document.getElementById('ayt-deneme-sifirla').addEventListener('click', function() {
        clearInterval(aytDenemeInterval);
        aytDenemeSuresi = 180 * 60;
        aytDenemeCalisiyor = false;
        document.getElementById('ayt-deneme-baslat').innerHTML = '<i class="fas fa-play"></i> Başlat';
        denemeSuresiGuncelle(aytDenemeSuresi, aytDenemeGosterge);
    });


    let ozelSure = 0;
    let ozelInterval;
    let ozelCalisiyor = false;
    const ozelGosterge = document.getElementById('ozel-zaman');
    const saatInput = document.getElementById('saat');
    const dakikaInput = document.getElementById('dakika');
    const saniyeInput = document.getElementById('saniye');


    document.getElementById('ozel-baslat').addEventListener('click', function() {
        if (!ozelCalisiyor) {
            const saat = parseInt(saatInput.value) || 0;
            const dakika = parseInt(dakikaInput.value) || 0;
            const saniye = parseInt(saniyeInput.value) || 0;

            if (saat === 0 && dakika === 0 && saniye === 0 && ozelSure <= 0) {
                alert('Lütfen bir süre girin!');
                return;
            }

            if (ozelSure <= 0) {
                ozelSure = (saat * 3600) + (dakika * 60) + saniye;
            }

            ozelCalisiyor = true;
            this.innerHTML = '<i class="fas fa-pause"></i> Durdur';

            saatInput.disabled = true;
            dakikaInput.disabled = true;
            saniyeInput.disabled = true;

            ozelInterval = setInterval(() => {
                if (ozelSure > 0) {
                    ozelSure--;
                    const s = Math.floor(ozelSure / 3600);
                    const d = Math.floor((ozelSure % 3600) / 60);
                    const sn = ozelSure % 60;
                    updateTimeUnit(ozelGosterge, '.hours', s);
                    updateTimeUnit(ozelGosterge, '.minutes', d);
                    updateTimeUnit(ozelGosterge, '.seconds', sn);
                } else {
                    clearInterval(ozelInterval);
                    ozelCalisiyor = false;
                    this.innerHTML = '<i class="fas fa-play"></i> Başlat';
                    saatInput.disabled = false;
                    dakikaInput.disabled = false;
                    saniyeInput.disabled = false;
                    sesCal('ozel');
                    alert('Süre doldu!');
                }
            }, 1000);
        } else {
            clearInterval(ozelInterval);
            ozelCalisiyor = false;
            this.innerHTML = '<i class="fas fa-play"></i> Başlat';
            saatInput.disabled = false;
            dakikaInput.disabled = false;
            saniyeInput.disabled = false;
        }
    });

    document.getElementById('ozel-sifirla').addEventListener('click', function() {
        clearInterval(ozelInterval);
        ozelCalisiyor = false;
        document.getElementById('ozel-baslat').innerHTML = '<i class="fas fa-play"></i> Başlat';
        saatInput.value = '0';
        dakikaInput.value = '0';
        saniyeInput.value = '0';
        saatInput.disabled = false;
        dakikaInput.disabled = false;
        saniyeInput.disabled = false;
        updateTimeUnit(ozelGosterge, '.hours', 0);
        updateTimeUnit(ozelGosterge, '.minutes', 0);
        updateTimeUnit(ozelGosterge, '.seconds', 0);
        ozelSure = 0;
    });


    denemeSuresiGuncelle(tytDenemeSuresi, tytDenemeGosterge);
    denemeSuresiGuncelle(aytDenemeSuresi, aytDenemeGosterge);

    updateTimeUnit(ozelGosterge, '.hours', 0);
    updateTimeUnit(ozelGosterge, '.minutes', 0);
    updateTimeUnit(ozelGosterge, '.seconds', 0);


    const tamEkranButonlari = document.querySelectorAll('.tam-ekran-btn');

    tamEkranButonlari.forEach(btn => {
        btn.addEventListener('click', () => {
            const panel = btn.closest('.sayac-panel');
            
            if (!document.fullscreenElement) {
                panel.classList.add('tam-ekran');
                if (panel.requestFullscreen) {
                    panel.requestFullscreen();
                } else if (panel.webkitRequestFullscreen) {
                    panel.webkitRequestFullscreen();
                } else if (panel.msRequestFullscreen) {
                    panel.msRequestFullscreen();
                }
                btn.textContent = 'Tam Ekrandan Çık';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                panel.classList.remove('tam-ekran');
                btn.textContent = 'Tam Ekran';
            }
        });
    });

    document.addEventListener('fullscreenchange', function() {
        if (!document.fullscreenElement) {
            document.querySelectorAll('.sayac-panel').forEach(panel => {
                panel.classList.remove('tam-ekran');
                const btn = panel.querySelector('.tam-ekran-btn');
                if (btn) btn.textContent = 'Tam Ekran';
            });
        }
    });

    document.addEventListener('webkitfullscreenchange', function() {
        if (!document.webkitFullscreenElement) {
            document.querySelectorAll('.sayac-panel').forEach(panel => {
                panel.classList.remove('tam-ekran');
                const btn = panel.querySelector('.tam-ekran-btn');
                if (btn) btn.textContent = 'Tam Ekran';
            });
        }
    });
});

function showSuccessMessage(message) {
    const existingToast = document.querySelector('.success-toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;

    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
        max-width: 300px;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {

    const analysisTypeBtns = document.querySelectorAll('.analysis-type-btn');
    const analysisForms = document.querySelectorAll('.analysis-form');

    analysisTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {

            analysisTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');


            const type = btn.dataset.type;
            analysisForms.forEach(form => {
                form.classList.remove('active');
                if (form.classList.contains(`${type}-analiz`)) {
                    form.classList.add('active');
                }
            });
        });
    });


    const dersSelect = document.getElementById('ders');
    const konuSelect = document.getElementById('konu');

    dersSelect.addEventListener('change', () => {
        const ders = dersSelect.value;
        konuSelect.innerHTML = '<option value="">Konu Seçiniz</option>';

        if (ders) {

            const konular = getKonularByDers(ders);
            
            if (konular.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Bu ders için konu bulunamadı';
                option.disabled = true;
                konuSelect.appendChild(option);
            } else {
                konular.forEach(konu => {
                    const option = document.createElement('option');
                    option.value = konu;
                    option.textContent = konu;
                    konuSelect.appendChild(option);
                });
            }
        }
    });


    const denemeTarihi = document.getElementById('denemeTarihi');
    denemeTarihi.value = new Date().toISOString().split('T')[0];


    const analyzeBtns = document.querySelectorAll('.analyze-btn');
    analyzeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const activeForm = document.querySelector('.analysis-form.active');
            if (activeForm.classList.contains('konu-analiz')) {
                konuAnaliziYap();
            } else {
                denemeAnaliziYap();
            }
        });
    });


    function konuAnaliziYap() {
        const total = parseInt(document.getElementById('total').value);
        const correct = parseInt(document.getElementById('correct').value);
        const incorrect = parseInt(document.getElementById('incorrect').value);
        

        const empty = total - correct - incorrect;

        if (empty < 0) {
            alert('Doğru ve yanlış sayılarının toplamı toplam soru sayısından fazla olamaz!');
            return;
        }

        const basariOrani = (correct / total) * 100;
        const net = correct - (incorrect / 4);

        sonuclariGoster({
            basariOrani,
            net,
            tahminiPuan: (net / total) * 500
        });
    }


    function denemeAnaliziYap() {
        const total = parseInt(document.getElementById('denemeTotal').value);
        const correct = parseInt(document.getElementById('denemeCorrect').value);
        const incorrect = parseInt(document.getElementById('denemeIncorrect').value);
        

        const empty = total - correct - incorrect;

        if (empty < 0) {
            alert('Doğru ve yanlış sayılarının toplamı toplam soru sayısından fazla olamaz!');
            return;
        }

        const basariOrani = (correct / total) * 100;
        const net = correct - (incorrect / 4);

        sonuclariGoster({
            basariOrani,
            net,
            tahminiPuan: (net / total) * 500
        });
    }


    function sonuclariGoster(sonuclar) {
        document.getElementById('successRate').textContent = `${sonuclar.basariOrani.toFixed(2)}%`;
        document.getElementById('netCount').textContent = sonuclar.net.toFixed(2);
        document.getElementById('estimatedScore').textContent = sonuclar.tahminiPuan.toFixed(2);


        document.getElementById('saveResult').disabled = false;
    }


    document.getElementById('saveResult').addEventListener('click', () => {
        const activeForm = document.querySelector('.analysis-form.active');
        const isKonuAnalizi = activeForm.classList.contains('konu-analiz');

        const sonuc = {
            tarih: new Date().toISOString(),
            tur: isKonuAnalizi ? 'konu' : 'deneme',
            ders: isKonuAnalizi ? dersSelect.value : document.getElementById('denemeTuru').value,
            konu: isKonuAnalizi ? konuSelect.value : document.getElementById('denemeAdi').value,
            toplam: parseInt(isKonuAnalizi ? document.getElementById('total').value : document.getElementById('denemeTotal').value),
            dogru: parseInt(isKonuAnalizi ? document.getElementById('correct').value : document.getElementById('denemeCorrect').value),
            yanlis: parseInt(isKonuAnalizi ? document.getElementById('incorrect').value : document.getElementById('denemeIncorrect').value),
            bos: parseInt(isKonuAnalizi ? document.getElementById('total').value : document.getElementById('denemeTotal').value) - parseInt(isKonuAnalizi ? document.getElementById('correct').value : document.getElementById('denemeCorrect').value) - parseInt(isKonuAnalizi ? document.getElementById('incorrect').value : document.getElementById('denemeIncorrect').value),
            net: parseFloat(document.getElementById('netCount').textContent),
            basari: parseFloat(document.getElementById('successRate').textContent)
        };


        let sonuclar = JSON.parse(localStorage.getItem('analizSonuclari')) || [];
        sonuclar.push(sonuc);
        localStorage.setItem('analizSonuclari', JSON.stringify(sonuclar));


        showSuccessMessage('Sonucunuz başarıyla kaydedildi!');


        gecmisSonuclariGoster();
    });


    function gecmisSonuclariGoster() {
        const tbody = document.getElementById('resultsTableBody');
        tbody.innerHTML = '';

        const sonuclar = JSON.parse(localStorage.getItem('analizSonuclari')) || [];
        const filterDers = document.getElementById('filterDers').value;

        const filtrelenmisSonuclar = sonuclar.filter(sonuc => {
            if (!filterDers) return true;
            

            if (filterDers.startsWith('konu-')) {
                const konuDers = filterDers.replace('konu-', '');
                return sonuc.ders === konuDers && sonuc.tur === 'konu';
            }
            

            return sonuc.ders === filterDers && sonuc.tur === 'deneme';
        });

        filtrelenmisSonuclar.forEach(sonuc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(sonuc.tarih).toLocaleDateString('tr-TR')}</td>
                <td><span class="analysis-type ${sonuc.tur}">${sonuc.tur === 'konu' ? 'Konu Analizi' : 'Deneme Analizi'}</span></td>
                <td>${sonuc.ders}</td>
                <td>${sonuc.konu}</td>
                <td>${sonuc.toplam}</td>
                <td>${sonuc.dogru}</td>
                <td>${sonuc.yanlis}</td>
                <td>${sonuc.net.toFixed(2)}</td>
                <td>${sonuc.basari.toFixed(2)}%</td>
                <td>
                    <button class="btn btn-danger" onclick="sonucSil('${sonuc.tarih}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
    });


        grafikOlustur(filtrelenmisSonuclar);
    }


    function grafikOlustur(sonuclar) {
        const ctx = document.getElementById('resultChart').getContext('2d');
        const chartContainer = document.getElementById('chartContainer');
        
        if (sonuclar.length === 0) {
            chartContainer.style.display = 'none';
            return;
        }

        chartContainer.style.display = 'block';

        const labels = sonuclar.map(sonuc => new Date(sonuc.tarih).toLocaleDateString('tr-TR'));
        const netler = sonuclar.map(sonuc => sonuc.net);
        const konular = sonuclar.map(sonuc => sonuc.konu);


        if (window.myChart) {
            window.myChart.destroy();
        }

        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Net',
                        data: netler,
                        borderColor: '#4a6bff',
                        backgroundColor: 'rgba(74, 107, 255, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#4a6bff',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Net Grafiği',
                        font: {
                            size: 18,
                            family: "'Poppins', sans-serif",
                            weight: 'bold'
                        },
                        padding: {
                            top: 20,
                            bottom: 20
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14,
                            family: "'Poppins', sans-serif"
                        },
                        bodyFont: {
                            size: 14,
                            family: "'Poppins', sans-serif"
                        },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                const index = context[0].dataIndex;
                                return `${labels[index]} - ${konular[index]}`;
                            },
                            label: function(context) {
                                return `Net: ${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 12
                            },
                            padding: 10
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 12
                            },
                            padding: 10
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                },
                elements: {
                    line: {
                        borderWidth: 3
                    }
                }
            }
        });
    }


    window.sonucSil = function(tarih) {
        if (confirm('Bu sonucu silmek istediğinizden emin misiniz?')) {
            let sonuclar = JSON.parse(localStorage.getItem('analizSonuclari')) || [];
            sonuclar = sonuclar.filter(sonuc => sonuc.tarih !== tarih);
            localStorage.setItem('analizSonuclari', JSON.stringify(sonuclar));
            gecmisSonuclariGoster();
        }
    };


    document.getElementById('filterDers').addEventListener('change', gecmisSonuclariGoster);


    gecmisSonuclariGoster();
});


function getKonularByDers(ders) {

    const userBranch = localStorage.getItem('userBranch') || 'sayisal';
    
    const konular = {
        matematik: {
            tyt: [
                'Temel Kavramlar',
                'Sayılar',
                'Rasyonel Sayılar',
                'Eşitsizlikler',
                'Mutlak Değer',
                'Üslü Sayılar',
                'Köklü Sayılar',
                'Çarpanlara Ayırma',
                'Oran-Orantı',
                'Denklemler',
                'Problemler',
                'Fonksiyonlar',
                'Geometri Temelleri'
            ],
            ayt: (userBranch === 'sayisal' || userBranch === 'esit-agirlik') ? [
                'Polinomlar',
                'İkinci Dereceden Denklemler',
                'Trigonometri',
                'Logaritma',
                'Limit ve Türev',
                'İntegral',
                'Analitik Geometri',
                'Diziler ve Seriler',
                'Olasılık',
                'İstatistik'
            ] : []
        },
        fizik: {
            tyt: [
                'Fizik Bilimine Giriş',
                'Madde ve Özellikleri',
                'Hareket ve Kuvvet',
                'Enerji',
                'Isı ve Sıcaklık',
                'Basınç',
                'Elektrik Temelleri',
                'Manyetizma Temelleri'
            ],
            ayt: userBranch === 'sayisal' ? [
                'Elektrik ve Manyetizma',
                'Dalgalar',
                'Modern Fizik',
                'Atom Fiziği',
                'Nükleer Fizik',
                'Optik',
                'Mekanik',
                'Termodinamik',
                'Elektromanyetik Dalgalar',
                'Fizikte Matematiksel Yöntemler'
            ] : []
        },
        kimya: {
            tyt: [
                'Kimya Bilimi',
                'Atom ve Yapısı',
                'Periyodik Sistem',
                'Kimyasal Bağlar',
                'Mol Kavramı',
                'Gazlar',
                'Çözeltiler',
                'Asit-Baz'
            ],
            ayt: userBranch === 'sayisal' ? [
                'Gazlar',
                'Sıvı Çözeltiler',
                'Kimyasal Tepkimeler',
                'Organik Kimya',
                'Kimyasal Hesaplamalar',
                'Elektrokimya',
                'Termokimya',
                'Kimyasal Denge',
                'Çözünürlük Dengesi',
                'Kimyasal Kinetik'
            ] : []
        },
        biyoloji: {
            tyt: [
                'Canlıların Yapısı',
                'Hücre',
                'Sistemler',
                'Kalıtım',
                'Ekoloji',
                'Bitki Biyolojisi',
                'Hayvan Biyolojisi',
                'İnsan Biyolojisi'
            ],
            ayt: userBranch === 'sayisal' ? [
                'Protein Sentezi',
                'Fotosentez',
                'Solunum',
                'Evrim',
                'Biyoteknoloji',
                'Genetik',
                'Populasyon Genetiği',
                'Ekosistem',
                'Hücresel Solunum',
                'Bitki Fizyolojisi'
            ] : []
        },
        turkce: {
            tyt: [
                'Paragraf',
                'Dil Bilgisi',
                'Anlatım Bozuklukları',
                'Noktalama İşaretleri',
                'Yazım Kuralları',
                'Ses Bilgisi',
                'Kelime Bilgisi',
                'Cümle Bilgisi'
            ],
            ayt: (userBranch === 'sozel' || userBranch === 'esit-agirlik') ? [
                'Eski Türk Edebiyatı', 'Tanzimat Edebiyatı', 'Servet-i Fünun Edebiyatı', 'Milli Edebiyat', 'Cumhuriyet Dönemi Edebiyatı', 'Çağdaş Türk Edebiyatı', 'Dünya Edebiyatı', 'Edebiyat Akımları'
            ] : []
        },
        tarih: {
            tyt: [
                'İlk Uygarlıklar',
                'İslam Tarihi',
                'Türk-İslam Tarihi',
                'Osmanlı Kuruluş',
                'Osmanlı Yükselme',
                'Osmanlı Duraklama',
                'Osmanlı Gerileme',
                'Osmanlı Dağılma'
            ],
            ayt: userBranch === 'sozel' ? [
                'İlk Çağ Uygarlıkları',
                'Orta Çağ Tarihi',
                'Yeni Çağ Tarihi',
                'Yakın Çağ Tarihi',
                'Türkiye Cumhuriyeti Tarihi',
                'Dünya Savaşları',
                'Soğuk Savaş Dönemi',
                'Günümüz Dünyası'
            ] : []
        },
        cografya: {
            tyt: [
                'Doğa ve İnsan',
                'Dünya\'da İklimler',
                'Türkiye\'nin İklimi',
                'Nüfus ve Yerleşme',
                'Ekonomik Faaliyetler',
                'Türkiye\'nin Coğrafi Konumu',
                'Türkiye\'nin Fiziki Coğrafyası',
                'Türkiye\'nin Beşeri Coğrafyası'
            ],
            ayt: userBranch === 'sozel' ? [
                'Fiziki Coğrafya',
                'Beşeri Coğrafya',
                'Ekonomik Coğrafya',
                'Siyasi Coğrafya',
                'Çevre ve Toplum',
                'Küresel Ortam',
                'Bölgeler ve Ülkeler',
                'Türkiye Coğrafyası'
            ] : []
        },
        felsefe: {
            tyt: [
                'Felsefeye Giriş',
                'Bilgi Felsefesi',
                'Varlık Felsefesi',
                'Ahlak Felsefesi',
                'Sanat Felsefesi',
                'Din Felsefesi',
                'Siyaset Felsefesi',
                'Bilim Felsefesi'
            ],
            ayt: userBranch === 'sozel' ? [
                'Felsefe Tarihi',
                'Mantık',
                'Psikoloji',
                'Sosyoloji',
                'Mantık ve Akıl Yürütme',
                'Felsefi Düşünce',
                'Felsefe ve Bilim',
                'Felsefe ve Sanat'
            ] : []
        },
        din: {
            tyt: [
                'İslam Dini Temel Bilgileri',
                'Kur\'an-ı Kerim',
                'Hz. Muhammed\'in Hayatı',
                'İslam Ahlakı',
                'İbadetler',
                'İslam Tarihi',
                'İslam Kültürü',
                'Din ve Toplum'
            ],
            ayt: userBranch === 'sozel' ? [
                'İslam Dini Temel Bilgileri',
                'Kur\'an-ı Kerim',
                'Hz. Muhammed\'in Hayatı',
                'İslam Ahlakı',
                'İbadetler',
                'İslam Tarihi',
                'İslam Kültürü',
                'Din ve Toplum'
            ] : []
        },
    };


    const dersKonular = konular[ders];
    if (!dersKonular) return [];
    
    return [...dersKonular.tyt, ...dersKonular.ayt];
}


function updateSubjectOptions() {
    const userBranch = localStorage.getItem('userBranch') || 'sayisal';
    

    const dersSelect = document.getElementById('ders');
    const options = dersSelect.querySelectorAll('option');
    
        options.forEach(option => {
            const value = option.value;
            let shouldShow = true;
            

            option.style.display = shouldShow ? 'block' : 'none';
        });
    

    const filterDersSelect = document.getElementById('filterDers');
    if (filterDersSelect) {
        const filterOptions = filterDersSelect.querySelectorAll('option');
        
        filterOptions.forEach(option => {
            const value = option.value;
            let shouldShow = true;
            

            option.style.display = shouldShow ? 'block' : 'none';
        });
    }
}


document.addEventListener('DOMContentLoaded', function() {
    updateSubjectOptions();
    

    window.addEventListener('storage', function(e) {
        if (e.key === 'userBranch') {
            updateSubjectOptions();
        }
    });
    

    window.addEventListener('branchChanged', function(e) {
        updateSubjectOptions();
    });
});

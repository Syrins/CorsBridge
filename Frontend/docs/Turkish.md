<div align="center">

![CorsBridge Banner](https://share.syrins.tech/images/cors.jpg)

<img src="https://share.syrins.tech/images/cors%20logo.png" alt="CorsBridge Logo" width="200"/>

# CorsBridge

### Üretime Hazır CORS Proxy Çözümü

[![Lisans: MIT](https://img.shields.io/badge/Lisans-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg)](https://tailwindcss.com/)

[Canlı Demo](https://cors.syrins.tech/) • [API Uç Noktası](https://api.cors.syrins.tech) • [Dokümantasyon](#-dokümantasyon) • [Örnekler](#-hızlı-başlangıç-örnekleri) • [Playground](#-interaktif-playground)

</div>

---

## 📋 İçindekiler

- [Genel Bakış](#-genel-bakış)
- [Neden CorsBridge?](#-neden-corsbridge)
- [Temel Özellikler](#-temel-özellikler)
- [Mimari](#-mimari)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Başlarken](#-başlarken)
- [Hızlı Başlangıç Örnekleri](#-hızlı-başlangıç-örnekleri)
- [API Referansı](#-api-referansı)
- [İnteraktif Playground](#-interaktif-playground)
- [Proje Yapısı](#-proje-yapısı)
- [Uluslararasılaştırma](#-uluslararasılaştırma)
- [Performans ve Optimizasyon](#-performans-ve-optimizasyon)
- [Güvenlik ve Gizlilik](#-güvenlik-ve-gizlilik)
- [Durum İzleme](#-durum-izleme)
- [Dağıtım Kılavuzu](#-dağıtım-kılavuzu)
- [Geliştirme İş Akışı](#-geliştirme-iş-akışı)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Sorun Giderme](#-sorun-giderme)
- [SSS](#-sss)
- [Yol Haritası](#-yol-haritası)
- [Lisans](#-lisans)
- [Teşekkürler](#-teşekkürler)

---

## 🌟 Genel Bakış

**CorsBridge**, web geliştirmede Cross-Origin Resource Sharing'in can sıkıcı engellerini ortadan kaldırmak için tasarlanmış modern, üretime hazır bir CORS proxy çözümüdür. CORS Anywhere gibi eski alternatiflerin aksine, platformumuz güzel bir pazarlama arayüzü, kapsamlı dokümantasyon, interaktif playground ve sağlam API altyapısı ile eksiksiz bir ekosistem sunar.

### Çözdüğümüz Problem

Web uygulamaları geliştirirken, harici API'lerden veri çekmeye çalışırken sıklıkla CORS hatalarıyla karşılaşırsınız:

```
'https://api.example.com/data' adresindeki fetch'e 'http://localhost:3000' kaynağından erişim 
CORS politikası tarafından engellenmiştir: İstenen kaynakta 'Access-Control-Allow-Origin' 
header'ı bulunmamaktadır.
```

**CorsBridge bu engeli anında ortadan kaldırır**, proxy yapılandırmalarıyla uğraşmak yerine özellikler geliştirmeye odaklanmanızı sağlar.

### Çözümümüz

Sunduklarımız:
- **Anında API Erişimi**: Proxy uç noktası olarak `https://api.cors.syrins.tech/{hedef-url}` kullanın
- **Güzel Web Arayüzü**: Pazarlama sitesi, dokümantasyon, örnekler ve playground
- **İki Dilli Destek**: Tam İngilizce/Türkçe yerelleştirme
- **Gerçek Zamanlı İzleme**: Çalışma süresi ve gecikme metrikleriyle canlı durum panosu
- **Geliştirici Öncelikli**: Modern React, TypeScript ve shadcn/ui ile geliştirildi

---

## 🚀 Neden CorsBridge?

| Özellik | CorsBridge | CORS Anywhere | Diğer Çözümler |
|---------|------------|---------------|----------------|
| **Modern Arayüz** | ✅ React 18 + shadcn/ui | ❌ Basit HTML | ❌ Arayüz Yok |
| **İnteraktif Playground** | ✅ Canlı test arayüzü | ❌ Mevcut değil | ❌ Mevcut değil |
| **İki Dilli Destek** | ✅ İNG/TR i18next ile | ❌ Sadece İngilizce | ❌ Sınırlı |
| **Gerçek Zamanlı Durum** | ✅ Çalışma süresi ve gecikme izleme | ❌ İzleme yok | ⚠️ Temel |
| **Üretime Hazır** | ✅ Optimize ve önbelleğe alınmış | ⚠️ Demo kalitesi | ⚠️ Değişken |
| **TypeScript** | ✅ Tam tip güvenliği | ❌ JavaScript | ⚠️ Değişken |
| **Dokümantasyon** | ✅ Kapsamlı kılavuzlar | ⚠️ Basit README | ⚠️ Değişken |
| **Kod Örnekleri** | ✅ Fetch/Axios/cURL parçacıkları | ⚠️ Sınırlı | ⚠️ Değişken |
| **Aktif Geliştirme** | ✅ Düzenli güncellemeler | ❌ Arşivlenmiş | ⚠️ Değişken |

---

## ✨ Temel Özellikler

### 🎨 Kullanıcı Deneyimi

- **Duyarlı Tasarım**: Mobilden masaüstüne sorunsuzca uyum sağlar
- **Karanlık Mod Hazır**: Tailwind CSS temalama desteğiyle inşa edildi
- **Erişilebilirlik Öncelikli**: ARIA işaretleyicileri, klavye navigasyonu, ekran okuyucu optimize
- **Pürüssüz Animasyonlar**: Hareket güvenli, performans bilinçli geçişler
- **Sezgisel Navigasyon**: React Router v6 ile temiz yönlendirme

### 🛠️ Geliştirici Deneyimi

- **Sıfır Yapılandırma**: Basit URL önlekleme ile saniyeler içinde kullanmaya başlayın
- **Canlı Playground**: API isteklerini doğrudan tarayıcıda test edin
- **Kopyala-Yapıştır Hazır**: Tüm büyük HTTP istemcileri için ön biçimlendirilmiş kod parçacıkları
- **TypeScript Desteği**: Tam tip tanımları ve IntelliSense
- **Sıcak Modül Değiştirme**: Geliştirme sırasında anlık geri bildirim

### 🌐 Yerelleştirme

- **İki Dilli Arayüz**: Eksiksiz İngilizce ve Türkçe çeviriler
- **Otomatik Algılama**: Tarayıcı tercihlerine göre otomatik dil seçimi
- **Kalıcı Seçim**: Kullanıcının dil tercihini localStorage'da hatırlar
- **Kolay Genişletme**: Basit JSON dosyalarıyla yeni diller ekleyin

### 📊 İzleme ve Güvenilirlik

- **Durum Panosu**: Gerçek zamanlı çalışma süresi ve performans metrikleri
- **Gecikme Takibi**: Farklı bölgelerdeki yanıt sürelerini izleyin
- **Önbellek İstatistikleri**: Önbellek isabet oranlarını ve optimizasyon verilerini görüntüleyin
- **Hız Limiti Bilgisi**: Şeffaf kullanım limitleri ve mevcut tüketim

---

## 🏗️ Mimari

### Frontend Mimarisi

```
┌────────────────────────────────────────────────────────────┐
│                     CorsBridge Frontend                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │  Ana      │  │  Dok.     │  │ Örnekler  │  │Playground│ │
│  │  Sayfa    │  │  Sayfa    │  │   Sayfa   │  │   Sayfa  │ │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └────┬─────┘ │
│        │              │              │              │      │
│        └──────────────┴──────────────┴──────────────┘      │
│                          │                                 │
│                ┌─────────▼─────────┐                       │
│                │  React Router v6  │                       │
│                │   + Lazy Loading  │                       │
│                └─────────┬─────────┘                       │
│                          │                                 │
│         ┌────────────────┼────────────────┐                │
│         │                │                │                │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐         │
│  │   shadcn/ui │  │  TanStack   │  │   i18next   │         │
│  │ Bileşenler  │  │    Query    │  │   Çeviri    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                            │
└──────────────────────────────┬─────────────────────────────┘
                               │
                   ┌───────────▼───────────┐
                   │  Backend API Sunucu   │
                   │ api.cors.syrins.tech  │
                   └───────────────────────┘
```

### Veri Akışı

```
Kullanıcı Tarayıcısı
    │
    ├─→ Dil Algılama (i18next)
    │   └─→ EN/TR çevirileri yükle
    │
    ├─→ Rota Navigasyonu (React Router)
    │   └─→ Sayfa bileşenlerini tembel yükle
    │
    ├─→ API İstekleri (TanStack Query)
    │   ├─→ Durum kontrolleri
    │   ├─→ Playground istekleri
    │   └─→ Önbellek ve yeniden deneme mantığı
    │
    └─→ UI Rendering (React + Tailwind)
        └─→ shadcn/ui bileşenleri
```

---

## 🛠️ Teknoloji Yığını

### Temel Teknolojiler

| Teknoloji | Versiyon | Amaç |
|------------|---------|------|
| **React** | 18.3.1 | Eş zamanlı özelliklerle UI kütüphanesi |
| **TypeScript** | 5.6.2 | Tip güvenli geliştirme |
| **Vite** | 7.0.0 | HMR ile yıldırım hızında build aracı |
| **Tailwind CSS** | 3.4.17 | Utility-first stil çerçevesi |
| **shadcn/ui** | Latest | Erişilebilir bileşen temelöğeleri |

### Durum ve Veri Yönetimi

| Kütüphane | Amaç |
|---------|------|
| **TanStack Query** | Sunucu durum yönetimi, önbellekleme ve senkronizasyon |
| **React Router** | Tembel yükleme ile bildirimsel yönlendirme |
| **i18next** | Uluslararasılaştırma çerçevesi |

### Geliştirici Araçları

| Araç | Amaç |
|------|------|
| **ESLint** | Düz yapılandırmayla kod linting |
| **PostCSS** | CSS işleme hattı |
| **SWC** | Rust tabanlı TypeScript/JavaScript derleyicisi |

### UI Bileşen Kütüphanesi

- **Button**: Birincil, ikincil, hayalet, yıkıcı varyantlar
- **Card**: Başlık ve altlıklı içerik kapsayıcıları
- **Tabs**: Erişilebilir sekmeli arayüzler
- **Drawer**: Mobil dostu kayar paneller
- **Dialog**: Modal diyaloglar ve uyarılar
- **Tooltip**: Bağlamsal yardım metni
- **Badge**: Durum ve kategori göstergeleri
- **Skeleton**: Yükleme durumu yer tutucuları

---

## 🚀 Başlarken

### Ön Koşullar

- **Node.js**: Versiyon 18.x veya daha yüksek
- **Paket Yöneticisi**: pnpm (önerilen), npm veya yarn
- **Git**: Repository'yi klonlamak için

### Kurulum

```bash
# Repository'yi klonlayın
git clone https://github.com/syrins/CorsBridge.git
cd CorsBridge

# Bağımlılıkları yükleyin
pnpm install

# Geliştirme sunucusunu başlatın
pnpm dev
```

Uygulama `http://localhost:5173` adresinde kullanılabilir olacaktır

### Ortam Yapılandırması

Kök dizinde bir `.env` dosyası oluşturun:

```env
# API Uç Noktaları
VITE_API_BASE_URL=https://api.cors.syrins.tech
VITE_STATUS_API=https://api.cors.syrins.tech/status
VITE_PLAYGROUND_PROXY=https://api.cors.syrins.tech

# Özellik Bayrakları
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=false

# Geliştirme Ayarları
VITE_DEV_MODE=true
```

### Üretim için Build

```bash
# Optimize edilmiş üretim build'ı oluşturun
pnpm build

# Üretim build'ını yerel olarak önizleyin
pnpm preview
```

Üretim paketi `dist/` dizininde oluşturulacaktır.

---

## 💡 Hızlı Başlangıç Örnekleri

### Fetch API Kullanımı

```javascript
// Basit GET isteği
fetch('https://api.cors.syrins.tech/https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Hata:', error));

// Header'lı POST isteği
fetch('https://api.cors.syrins.tech/https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token-here'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com'
  })
})
  .then(response => response.json())
  .then(data => console.log('Başarılı:', data))
  .catch(error => console.error('Hata:', error));
```

### Axios Kullanımı

```javascript
import axios from 'axios';

// Temel instance yapılandırması
const corsProxy = axios.create({
  baseURL: 'https://api.cors.syrins.tech/'
});

// GET isteği
corsProxy.get('https://api.example.com/data')
  .then(response => console.log(response.data))
  .catch(error => console.error('Hata:', error));

// Özel header'larla POST isteği
corsProxy.post('https://api.example.com/users', {
  name: 'Jane Smith',
  email: 'jane@example.com'
}, {
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'custom-value'
  }
})
  .then(response => console.log('Oluşturuldu:', response.data))
  .catch(error => console.error('Hata:', error));
```

### cURL Kullanımı

```bash
# Basit GET isteği
curl https://api.cors.syrins.tech/https://api.example.com/data

# JSON payload ile POST isteği
curl -X POST \
  https://api.cors.syrins.tech/https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'

# Özel header'larla GET
curl -X GET \
  https://api.cors.syrins.tech/https://api.example.com/data \
  -H "Accept: application/json" \
  -H "X-API-Key: your-api-key"
```

### React Entegrasyonu Örneği

```typescript
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const CORS_PROXY = 'https://api.cors.syrins.tech/';

function useExternalAPI(endpoint: string) {
  return useQuery({
    queryKey: ['external-api', endpoint],
    queryFn: async () => {
      const { data } = await axios.get(`${CORS_PROXY}${endpoint}`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 dakika
    cacheTime: 10 * 60 * 1000, // 10 dakika
  });
}

// Bileşende kullanım
function DataComponent() {
  const { data, isLoading, error } = useExternalAPI(
    'https://api.example.com/data'
  );

  if (isLoading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error.message}</div>;

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

---

## 📚 API Referansı

### Temel URL

```
https://api.cors.syrins.tech/
```

### İstek Formatı

```
https://api.cors.syrins.tech/{HEDEF_URL}
```

`{HEDEF_URL}` yerine erişmek istediğiniz tam URL'i protokol dahil (http:// veya https://) yazın.

### Desteklenen HTTP Metotları

- ✅ `GET` - Kaynak getirme
- ✅ `POST` - Kaynak oluşturma
- ✅ `PUT` - Kaynak güncelleme
- ✅ `PATCH` - Kısmi güncellemeler
- ✅ `DELETE` - Kaynak silme
- ✅ `OPTIONS` - CORS preflight
- ✅ `HEAD` - Metadata alma

### Header'lar

Orijinal isteğinizdeki tüm header'lar hedef sunucuya iletilir. Proxy otomatik olarak şunları ekler:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: *
Access-Control-Expose-Headers: *
```

### Hız Limitleri

- **Ücretsiz Katman**: IP başına saatte 1000 istek
- **Yanıt Boyutu**: İstek başına maksimum 10MB
- **Zaman Aşımı**: İstek başına 30 saniye

### Hata Yönetimi

Proxy standart HTTP durum kodlarını döndürür:

| Durum Kodu | Anlamı |
|------------|--------|
| 200-299 | Başarılı |
| 400 | Kötü İstek - Geçersiz hedef URL |
| 429 | Çok Fazla İstek - Hız limiti aşıldı |
| 500 | Sunucu Hatası |
| 502 | Kötü Ağ Geçidi - Hedef sunucuya erişilemiyor |
| 504 | Ağ Geçidi Zaman Aşımı - İstek çok uzun sürdü |

### Örnek Hata Yanıtı

```json
{
  "error": "Hız limiti aşıldı",
  "message": "Saat başına maksimum istek sayısını aştınız",
  "retryAfter": 3600,
  "limit": 1000,
  "remaining": 0
}
```

---

## 🎮 İnteraktif Playground

**Playground** sayfası şunları yapabileceğiniz canlı bir test ortamı sağlar:

### Özellikler

1. **Metot Seçimi**: GET, POST, PUT, PATCH, DELETE arasından seçim yapın
2. **URL Girişi**: Proxy'lenecek herhangi bir hedef URL girin
3. **Header Yönetimi**: Anahtar-değer çiftleriyle özel header'lar ekleyin
4. **İstek Gövdesi**: POST/PUT/PATCH istekleri için JSON payload'ları ekleyin
5. **Canlı Çalıştırma**: İstekleri gönderin ve yanıtları gerçek zamanlı görüntüleyin
6. **Yanıt Görüntüleyici**: Header'ları, durum kodlarını ve gövde verilerini inceleyin
7. **Kopyalama Seçenekleri**: cURL, Fetch veya Axios kodu olarak kopyalayın

### Playground Arayüzü

```typescript
interface PlaygroundRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  body?: string;
}

interface PlaygroundResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration: number;
}
```

### Playground Kullanımı

1. `/playground` adresine gidin
2. HTTP metodunu seçin
3. Hedef URL girin (örn. `https://api.github.com/users/octocat`)
4. İsteğe bağlı header'lar veya gövde ekleyin
5. "İstek Gönder" butonuna tıklayın
6. Sözdizimi vurgulamalı biçimlendirilmiş yanıtı görüntüleyin
7. Üretilen kodu tercih ettiğiniz formatta kopyalayın

---

## 📁 Proje Yapısı

```
CorsBridge/
├── public/                    # Statik varlıklar
│   ├── locales/              # Çeviri dosyaları
│   │   ├── en.json           # İngilizce çeviriler
│   │   └── tr.json           # Türkçe çeviriler
│   └── favicon.ico
├── src/
│   ├── components/           # React bileşenleri
│   │   ├── layout/          # Layout bileşenleri
│   │   │   ├── Navbar.tsx   # Navigasyon çubuğu
│   │   │   ├── Footer.tsx   # Site altlığı
│   │   │   └── LanguageSelector.tsx
│   │   └── ui/              # shadcn/ui temelleri
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── tabs.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── tooltip.tsx
│   │       ├── badge.tsx
│   │       └── skeleton.tsx
│   ├── hooks/               # Özel React hooks
│   │   ├── use-mobile.ts   # Mobil algılama
│   │   ├── use-toast.ts    # Toast bildirimleri
│   │   └── use-query.ts    # TanStack Query yardımcıları
│   ├── lib/                # Yardımcı kütüphaneler
│   │   ├── utils.ts        # Yardımcı fonksiyonlar
│   │   └── cn.ts           # Classname birleştirici
│   ├── pages/              # Rota sayfaları
│   │   ├── Home.tsx        # Açılış sayfası
│   │   ├── Docs.tsx        # Dokümantasyon
│   │   ├── Examples.tsx    # Kod örnekleri
│   │   ├── Playground.tsx  # İnteraktif playground
│   │   ├── Status.tsx      # Durum panosu
│   │   ├── Donate.tsx      # Bağış sayfası
│   │   └── NotFound.tsx    # 404 sayfası
│   ├── i18n/               # Uluslararasılaştırma
│   │   └── config.ts       # i18next yapılandırması
│   ├── App.tsx             # Kök bileşen
│   ├── main.tsx            # Giriş noktası
│   └── index.css           # Global stiller
├── .env                    # Ortam değişkenleri
├── .eslintrc.cjs          # ESLint yapılandırması
├── index.html             # HTML şablonu
├── package.json           # Bağımlılıklar
├── postcss.config.js      # PostCSS yapılandırması
├── tailwind.config.js     # Tailwind yapılandırması
├── tsconfig.json          # TypeScript yapılandırması
├── vite.config.ts         # Vite yapılandırması
└── README.md              # Bu dosya
```

### Önemli Dizinlerin Açıklaması

#### `/src/pages`
React Router üzerinden tembel yüklenen rota seviyesi bileşenler. Her sayfa kendi veri çekme işlemini TanStack Query ile yönetir.

#### `/src/components/ui`
Radix UI üzerine inşa edilmiş Shadcn/ui temelleri. Bu bileşenler:
- Tamamen erişilebilir (ARIA uyumlu)
- Klavye ile gezinilebilir
- Tailwind ile temalayabilir
- TypeScript doğal desteği

#### `/src/hooks`
Paylaşılan mantık için özel hooks:
- `use-mobile`: Duyarlı kesme noktası algılama
- `use-toast`: Global toast bildirim sistemi
- `use-query`: Geliştirilmiş TanStack Query sarmalayıcıları

#### `/src/i18n`
Uluslararasılaştırma kurulumu:
- Dil algılama
- localStorage kalıcılığı
- Çeviri dosyalarının tembel yüklenmesi
- Tip güvenli çeviri anahtarları

---

## 🌍 Uluslararasılaştırma

### Desteklenen Diller

- 🇬🇧 **İngilizce** (Varsayılan)
- 🇹🇷 **Türkçe**

### Çeviri Yapısı

```typescript
// locales/tr.json
{
  "nav": {
    "home": "Ana Sayfa",
    "docs": "Dokümantasyon",
    "examples": "Örnekler",
    "playground": "Playground",
    "status": "Durum",
    "donate": "Bağış Yap"
  },
  "home": {
    "hero": {
      "title": "CORS Kısıtlamalarını Anında Aşın",
      "subtitle": "Modern web uygulamaları için üretime hazır proxy çözümü",
      "cta": "Başlayın"
    }
  }
}
```

### Bileşenlerde Kullanım

```typescript
import { useTranslation } from 'react-i18next';

function HomePage() {
  const { t } = useTranslation();

  return (
    <h1>{t('home.hero.title')}</h1>
  );
}
```

  return (
    <h1>{t('home.hero.title')}</h1>
  );
}
```

### Yeni Dil Ekleme

1. Yeni çeviri dosyası oluşturun: `public/locales/{dil}.json`
2. `src/i18n/config.ts` dosyasını güncelleyin:

```typescript
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      tr: { translation: trTranslations },
      es: { translation: esTranslations }, // Yeni dil
    },
    fallbackLng: 'en',
  });
```

3. `LanguageSelector.tsx` içinde dil seçici seçeneği ekleyin

---

## ⚡ Performans ve Optimizasyon

### Build Optimizasyonu

- **Kod Bölme**: Rota tabanlı tembel yükleme başlangıç paketini azaltır
- **Ağaç Sallama**: Vite + SWC ile ölü kod eleme
- **Varlık Sıkıştırma**: Statik varlıklar için Gzip/Brotli sıkıştırma
- **CSS Temizleme**: Üretimde kullanılmayan Tailwind sınıfları kaldırılır

### Çalışma Zamanı Performansı

- **TanStack Query Önbellekleme**: Gereksiz API çağrılarını azaltır
- **React 18 Eş Zamanlı Özellikler**: Otomatik toplu işleme ve geçişler
- **Sanal Kaydırma**: Büyük listelerin verimli render edilmesi
- **Görsel Optimizasyonu**: Tembel yükleme ve duyarlı görseller

### Paket Boyutu

```
Gzip Sıkıştırılmış Paket Boyutları:
├── React + React DOM: ~45 KB
├── React Router: ~12 KB
├── TanStack Query: ~14 KB
├── i18next: ~18 KB
├── shadcn/ui + Radix: ~35 KB
├── Uygulama Kodu: ~55 KB
└── Toplam: ~179 KB
```

### Lighthouse Skorları (Hedef)

- **Performans**: 95+
- **Erişilebilirlik**: 100
- **En İyi Uygulamalar**: 95+
- **SEO**: 100

---

## 🔒 Güvenlik ve Gizlilik

### Veri Gizliliği

- ✅ **Loglama Yok**: İsteklerinizi veya yanıtlarınızı saklamayız
- ✅ **Takip Yok**: Analitik veya kullanıcı takibi yok
- ✅ **Veri Saklanmaz**: Tüm veriler proxy'den geçtikten hemen sonra silinir
- ✅ **Sadece HTTPS**: Tüm bağlantılar şifrelenir

### Güvenlik Önlemleri

- **Hız Sınırlama**: Kötüye kullanım ve DDoS saldırılarını önler
- **Girdi Doğrulama**: Tüm kullanıcı girdilerini temizler
- **XSS Koruması**: React'ın yerleşik kaçış sistemi
- **CSRF Token'ları**: Durum değiştiren işlemler korunur
- **İçerik Güvenlik Politikası**: Kısıtlayıcı CSP header'ları

### En İyi Uygulamalar

⚠️ **Hassas verileri asla açık proxy'ler üzerinden göndermeyin**:
- Kimlik doğrulama uç noktalarını proxy'lemeyin
- API anahtarları veya token'lar göndermeyin
- Sadece geliştirme/test için kullanın
- Üretim için kendi instance'ınızı dağıtın

---

## 📊 Durum İzleme

### Gerçek Zamanlı Metrikler

Durum sayfası şunları görüntüler:

- **Çalışma Süresi Yüzdesi**: 24 saatlik kullanılabilirlik
- **Ortalama Gecikme**: Yanıt süresi metrikleri
- **Önbellek İsabet Oranı**: Verimlilik istatistikleri
- **Hız Limiti Durumu**: Mevcut kullanım vs. limitler
- **Aktif İstekler**: Eş zamanlı bağlantılar

### Durum API Uç Noktası

```typescript
interface StatusResponse {
  status: 'operational' | 'degraded' | 'down';
  uptime: number; // Yüzde
  latency: {
    average: number; // milisaniye
    p50: number;
    p95: number;
    p99: number;
  };
  cache: {
    hitRate: number; // Yüzde
    size: number; // Bayt
  };
  rateLimit: {
    limit: number;
    remaining: number;
    reset: number; // Unix zaman damgası
  };
}
```

### Kullanım Örneği

```typescript
import { useQuery } from '@tanstack/react-query';

function StatusDashboard() {
  const { data: status } = useQuery({
    queryKey: ['status'],
    queryFn: () => 
      fetch('https://api.cors.syrins.tech/status')
        .then(res => res.json()),
    refetchInterval: 30000, // Her 30 saniyede bir yeniden çek
  });

  return (
    <div>
      <h2>Durum: {status?.status}</h2>
      <p>Çalışma Süresi: {status?.uptime}%</p>
      <p>Gecikme: {status?.latency.average}ms</p>
    </div>
  );
}
```

---

## 🚢 Dağıtım Kılavuzu

### Vercel (Önerilen)

```bash
# Vercel CLI'yi yükleyin
npm i -g vercel

# Dağıtın
vercel --prod
```

### Netlify

```bash
# Netlify CLI'yi yükleyin
npm i -g netlify-cli

# Build edin ve dağıtın
netlify deploy --prod --dir=dist
```

### Cloudflare Pages

1. Git repository'nizi bağlayın
2. Build komutunu ayarlayın: `pnpm build`
3. Çıktı dizinini ayarlayın: `dist`
4. Push'ta otomatik dağıtın

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Üretim için Ortam Değişkenleri

```env
VITE_API_BASE_URL=https://api.cors.syrins.tech
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

---

## 🔧 Development Workflow

### Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run linter
pnpm lint

# Type check
pnpm type-check

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Code Quality

```bash
# Prettier ile kodu formatlayın
pnpm format

# Lint ve otomatik düzeltme
pnpm lint:fix

# Watch modunda tip kontrolü
pnpm type-check:watch
```

### Test Etme

```bash
# Birim testlerini çalıştırın
pnpm test

# Watch modunda testleri çalıştırın
pnpm test:watch

# Kapsam raporu oluşturun
pnpm test:coverage
```

---

## 🤝 Katkıda Bulunma

Topluluktan gelen katkıları memnuniyetle karşılıyoruz! İşte nasıl yardımcı olabilirsiniz:

### Katkı Süreci

1. **Repository'yi fork edin**
2. **Feature branch oluşturun**: `git checkout -b feature/harika-ozellik`
3. **Değişikliklerinizi yapın**
4. **Conventional commit ile commit edin**: `git commit -m "feat: harika özellik eklendi"`
5. **Fork'unuza push edin**: `git push origin feature/harika-ozellik`
6. **Pull Request açın**

### Commit Kuralları

[Conventional Commits](https://www.conventionalcommits.org/) standardını takip ediyoruz:

```
feat: Yeni özellik ekle
fix: Hata düzeltmesi
docs: Dokümantasyon değişiklikleri
style: Kod stili değişiklikleri (formatlama)
refactor: Kod yeniden yapılandırması
test: Test ekleme
chore: Bakım görevleri
```

### Kod Stili

- Tüm yeni kodlar için TypeScript kullanın
- ESLint kurallarına uyun
- Hook'lu fonksiyonel bileşenler kullanın
- Anlamlı yorumlar yazın
- Hem EN/TR için çeviriler ekleyin

### Pull Request Kuralları

- Değişikliklerinizi açıkça tanımlayın
- İlgili issue'lara referans verin
- UI değişiklikleri için ekran görüntüleri ekleyin
- Tüm testlerin başarılı olduğundan emin olun
- Gerektiğinde dokümantasyonu güncelleyin

---

## 🐛 Sorun Giderme

### Yaygın Sorunlar

#### Sorun: CORS hataları hala oluşuyor

**Çözüm**: Tam proxy URL formatını kullandığınızdan emin olun:
```javascript
// ❌ Yanlış
fetch('api.example.com/data')

// ✅ Doğru
fetch('https://api.cors.syrins.tech/https://api.example.com/data')
```

#### Sorun: 429 Hız Sınırı Hatası

**Çözüm**: Ücretsiz katman limitini aştınız. Hız sınırının sıfırlanmasını bekleyin veya daha yüksek limitler için bizimle iletişime geçin.

#### Sorun: Yavaş yanıt süreleri

**Çözüm**: 
- Hedef sunucunun yanıt süresini kontrol edin
- Ağ bağlantınızı doğrulayın
- TanStack Query ile tarafınızda önbellekleme kullanmayı düşünün

#### Sorun: TypeScript hataları ile build başarısız oluyor

**Çözüm**:
```bash
# Önbelleği temizleyin ve yeniden yükleyin
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

#### Sorun: Çeviriler yüklenmiyor

**Çözüm**: Çeviri dosyalarının `public/locales/` dizininde bulunduğundan ve bileşenlerde kullanılan anahtarlarla eşleştiğinden emin olun.

---

## ❓ SSS (Sık Sorulan Sorular)

### Genel Sorular

**S: Bu servis ücretsiz mi?**  
C: Evet, ücretsiz katmanımız IP başına saatte 1000 istek içerir. Kurumsal planlar için bizimle iletişime geçin.

**S: İsteklerimi kayıt ediyor musunuz?**  
C: Hayır, hiçbir istek/yanıt verisini kaydetmiyor veya saklamıyoruz. Tüm trafik proxy'lendikten sonra hemen silinir.

**S: Bunu üretimde kullanabilir miyim?**  
C: Teknik olarak mümkün olsa da, güvenilirlik ve güvenlik için üretimde kendi örneğinizi dağıtmanızı öneririz.

**S: Maksimum yanıt boyutu nedir?**  
C: Mevcut limit istek başına 10MB'dir. Daha büyük yükler kesilecektir.

**S: WebSocket bağlantılarını destekliyor musunuz?**  
C: Şu anda hayır. Proxy'miz yalnızca standart HTTP/HTTPS isteklerini destekler.

### Teknik Sorular

**S: Proxy ile bile CORS hataları alıyorum, neden?**  
C: Hedef URL'yi `https://api.cors.syrins.tech/` ile doğru şekilde öneklendirdiğinizden emin olun. Hedef URL'de protokol (http:// veya https://) bulunmalıdır.

**S: Localhost veya özel IP'leri proxy'leyebilir miyim?**  
C: Hayır, güvenlik nedeniyle özel IP aralıklarına, localhost'a ve bulut metadata uç noktalarına yapılan istekleri engelliyoruz.

**S: Kimlik doğrulama başlıklarını nasıl eklerim?**  
C: Fetch/axios isteğinizde normal şekilde ekleyin. Tüm başlıklar hedef sunucuya iletilir:

```javascript
fetch('https://api.cors.syrins.tech/https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer your-token',
    'X-API-Key': 'your-key'
  }
})
```

**S: Proxy yanıtları önbelleğe alıyor mu?**  
C: Evet, uygun `Cache-Control` başlıklarına sahip GET istekleri gelişmiş performans için önbelleğe alınır. POST/PUT/DELETE istekleri asla önbelleğe alınmaz.

**S: Önbelleklemeyi devre dışı bırakabilir miyim?**  
C: Önbelleği atlamak için isteğinize `Cache-Control: no-cache` başlığı ekleyin.

### Sorun Giderme

**S: Sık sık 429 hataları alıyorum**  
C: Hız sınırına ulaştınız. Şunları düşünün:
- TanStack Query ile istemci tarafı önbellekleme uygulama
- Mümkün olduğunda istekleri toplu yapma
- Artan limitler için bizimle iletişime geçme

**S: Proxy yavaş çalışıyor**  
C: Yanıt süresi şunlara bağlıdır:
- Hedef sunucunun yanıt süresi
- Sunucularımıza coğrafi uzaklık
- Mevcut sunucu yükü
- Ağ koşulları

**S: Bunu kendi sunucumda barındırabilir miyim?**  
C: Evet! Backend kodu açık kaynaklıdır. Talimatlar için [Dağıtım Kılavuzu](#-dağıtım-kılavuzu) bölümüne bakın.

---

## 🗺️ Yol Haritası

### Mevcut Sürüm: 1.0.0

### Planlanan Özellikler

#### Q1 2025
- [ ] **WebSocket Desteği**: Gerçek zamanlı çift yönlü iletişim
- [ ] **GraphQL Playground**: Özel GraphQL sorgu arayüzü
- [ ] **İstek Geçmişi**: Önceki istekleri kaydetme ve tekrar oynatma
- [ ] **Ekip Çalışma Alanları**: İşbirlikçi playground oturumları

#### Q2 2025
- [ ] **API Anahtarı Kimlik Doğrulaması**: Güvenli, hız sınırından bağımsız erişim
- [ ] **Özel Alan Adları**: Proxy uç noktaları için kendi alan adınızı getirin
- [ ] **Gelişmiş Analitik**: İstek kalıpları ve kullanım içgörüleri
- [ ] **Webhook Testi**: Mock sunucularla webhook uç noktalarını test etme

#### Q3 2025
- [ ] **İstek Mocking**: Test için mock yanıtlar oluşturma
- [ ] **Yük Testi**: API'lerinizi proxy üzerinden stres testi yapma
- [ ] **Yanıt Dönüşümü**: Yanıtları anında değiştirme
- [ ] **Çok Bölgeli Dağıtım**: Daha düşük gecikme için edge konumları

#### Q4 2025
- [ ] **SDK Kütüphaneleri**: Popüler diller için resmi istemci kütüphaneleri
- [ ] **CI/CD Entegrasyonu**: GitHub Actions, GitLab CI eklentileri
- [ ] **İzleme Entegrasyonları**: Datadog, New Relic, Prometheus dışa aktarıcıları
- [ ] **Kurumsal Özellikler**: SLA garantileri, özel destek

### Topluluk Önerileri

Topluluk geri bildirimlerine dayalı olarak özellikleri aktif olarak topluyoruz ve önceliklendiriyoruz. Fikirlerinizi şu yollarla gönderin:
- [GitHub Issues](https://github.com/syrins/CorsBridge/issues)
- [Discord Topluluğu](#)
- [E-posta](mailto:support@syrins.tech)

---

## 📄 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır.

```
MIT License

Copyright (c) 2024 Syrins

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Tam detaylar için [LICENSE](./LICENSE) dosyasına bakın.

---

## 🙏 Teşekkürler

### Açık Kaynak Projeler

Bu proje, şu harika açık kaynak kütüphaneler olmadan mümkün olmazdı:

- **[React](https://reactjs.org/)** - UI'ımızın temeli
- **[Vite](https://vitejs.dev/)** - Şimşek hızında derleme araçları
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first stil çerçevesi
- **[shadcn/ui](https://ui.shadcn.com/)** - Güzel, erişilebilir bileşenler
- **[Radix UI](https://www.radix-ui.com/)** - Stilsiz, erişilebilir primitive'ler
- **[TanStack Query](https://tanstack.com/query)** - Güçlü veri senkronizasyonu
- **[React Router](https://reactrouter.com/)** - Deklaratif yönlendirme
- **[i18next](https://www.i18next.com/)** - Uluslararasılaştırma çerçevesi
- **[Lucide Icons](https://lucide.dev/)** - Güzel ikon seti

### İlham Kaynakları

- **[CORS Anywhere](https://github.com/Rob--W/cors-anywhere)** - CORS proxy'leme için orijinal ilham kaynağı
- **[Postman](https://www.postman.com/)** - API testi UX kalıpları
- **[httpbin.org](https://httpbin.org/)** - HTTP test araçları
- **[JSONPlaceholder](https://jsonplaceholder.typicode.com/)** - Test için ücretsiz sahte API

### Katkıda Bulunanlar

Bu projeyi şekillendirmeye yardımcı olan tüm katkıda bulunanlara özel teşekkürler:

<div align="center">

![Contributors](https://contrib.rocks/image?repo=syrins/CorsBridge)

</div>

### Topluluk

Şunları yapan gelişen geliştirici topluluğumuza teşekkürler:
- Hata ve sorunları bildiriyorlar
- Yeni özellikler öneriyorlar
- Kod ve dokümantasyona katkıda bulunuyorlar
- Projeyi başkalarıyla paylaşıyorlar

---

<div align="center">

## 💖 Bu Projeyi Destekleyin

CorsBridge'i faydalı buluyorsanız, geliştirilmesini desteklemeyi düşünün:

[![Bağış Yap](https://img.shields.io/badge/Bağış%20Yap-PayPal-blue.svg)](https://paypal.me/syrins)
[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub-pink.svg)](https://github.com/sponsors/syrins)
[![Buy Me A Coffee](https://img.shields.io/badge/Kahve%20Ismarla-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/syrins)

---

**[Syrins](https://syrins.tech) tarafından ❤️ ile yapılmıştır**

[Website](https://cors.syrins.tech) • [API Docs](https://cors.syrins.tech/docs) • [GitHub](https://github.com/syrins/CorsBridge) • [Twitter](https://twitter.com/syrins) • [Discord](#)

⭐ Bu projeyi faydalı buluyorsanız GitHub'da yıldızlayın!

---

*Son Güncelleme: Kasım 2024*

</div>

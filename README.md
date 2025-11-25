<p align="center">
  <a href="#-english-documentation">
    <img src="https://img.shields.io/badge/English%20Docs-005BBB?style=for-the-badge" />
  </a>
  <a href="#-türkçe-dokümantasyon">
    <img src="https://img.shields.io/badge/Türkçe%20Dokümantasyon-F39C12?style=for-the-badge" />
  </a>
</p>

# 🌉 **Cors-Bridge**
### Modern • Secure • Full-Stack CORS Proxy Platform  
#### (English & Turkish Documentation Included)

<p align="center">
  <img src="https://share.syrins.tech/images/cors.jpg" width="880" />
</p>

---

# 🇺🇸 English Documentation
## 📘 What Is Cors-Bridge?

Cors-Bridge is a **modern, secure and production-ready CORS proxy platform**.  
It helps developers bypass browser CORS restrictions safely while offering:

- SSRF protection  
- URL & hostname validation  
- Private IP blocking (configurable)  
- Multi-layer caching (Memory/Redis)  
- Request deduplication  
- Per-host circuit breakers  
- Prometheus-compatible metrics  
- Health endpoints  
- React-based Playground + examples  

It consists of:

- **Backend:** Hardened Node.js/TypeScript proxy  
- **Frontend:** React + Vite app with examples, docs and a playground  

---

## 📄 Documentation (English)

| Category | Link |
|---------|------|
| **Frontend Docs (EN)** | https://github.com/Syrins/Cors-Bridge/blob/main/Frontend/Docs/English.md |
| **Backend Docs (EN)**  | https://github.com/Syrins/Cors-Bridge/blob/main/Backend/Docs/English.md |

---

## 🧪 Usage Examples (EN)

### **1) Simple GET request**
```javascript
const response = await fetch(
  "https://api.cors.syrins.tech/?url=https://example.com/api"
);
const data = await response.json();
console.log(data);
````

### **2) POST request with headers**

```javascript
const res = await fetch(
  "https://api.cors.syrins.tech/?url=https://example.com/login",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: "test", pass: "1234" })
  }
);
console.log(await res.json());
```

---

## ⚙ Backend Overview (EN)

* Node.js + TypeScript
* SSRF Guard (IP range + hostname checks)
* Rate limiting & abuse prevention
* Redis or memory cache
* In-flight request deduplication
* Circuit breaker per target
* `/health`, `/live`, `/ready`
* `/metrics` & `/metrics/prometheus`

---

## 🎨 Frontend Overview (EN)

* React 18 + Vite
* Tailwind CSS + shadcn/ui
* EN/TR bilingual interface
* Playground (live request tester)
* Status page (latency, uptime, health)
* Ready-to-copy examples

---

## 🔎 Comparison vs Other CORS Proxy Services

| Feature             | Cors-Bridge           | CORS Anywhere | AllOrigins       | Whatever Origin  |
| ------------------- | --------------------- | ------------- | ---------------- | ---------------- |
| SSRF Protection     | ✔ Yes                 | ✖ No          | ✖ Not documented | ✖ Not documented |
| Private IP Blocking | ✔ Yes                 | ✖ No          | ✖ No             | ✖ No             |
| URL Sanitization    | ✔ Advanced            | ✖ Basic       | ✖ Basic          | ✖ Basic          |
| Caching             | ✔ Memory/Redis        | ✖ No          | ✖ Not documented | ✖ Not documented |
| Deduplication       | ✔ Yes                 | ✖ No          | ✖ No             | ✖ No             |
| Circuit Breaker     | ✔ Yes                 | ✖ No          | ✖ No             | ✖ No             |
| Metrics             | ✔ Prometheus          | ✖ No          | ✖ No             | ✖ No             |
| Playground          | ✔ Yes                 | ✖ No          | ✖ No             | ✖ No             |
| JSONP Support       | ✖ No                  | ✖ No          | ✔ Yes            | ✔ Yes            |
| Best Use Case       | Secure production use | Simple proxy  | Quick demos      | Legacy apps      |

---

---

# 🇹🇷 Türkçe Dokümantasyon

## 📘 Cors-Bridge Nedir?

Cors-Bridge, **modern, güvenli ve production-ready bir CORS proxy platformudur.**
Tarayıcı kaynaklı CORS engellerini güvenli bir şekilde aşmayı sağlar.

Özellikler:

* SSRF koruması
* URL & hostname doğrulama
* Özel IP engelleme (opsiyonel)
* Çok katmanlı cache (Bellek/Redis)
* İstek tekilleştirme
* Hedef başına devre kesici
* Prometheus metrikleri
* Health endpoint’leri
* React tabanlı Playground + örnekler

Modüller:

* **Backend:** Güvenli Node.js/TypeScript proxy
* **Frontend:** React + Vite dokümantasyon ve Playground uygulaması

---

## 📄 Dokümantasyon (Türkçe)

| Kategori        | Bağlantı                                                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend TR** | [https://github.com/Syrins/Cors-Bridge/blob/main/Frontend/Docs/Turkish.md](https://github.com/Syrins/Cors-Bridge/blob/main/Frontend/Docs/Turkish.md) |
| **Backend TR**  | [https://github.com/Syrins/Cors-Bridge/blob/main/Backend/Docs/Turkish.md](https://github.com/Syrins/Cors-Bridge/blob/main/Backend/Docs/Turkish.md)   |

---

## 🧪 Kullanım Örnekleri (TR)

### **1) Basit GET isteği**

```javascript
const yanit = await fetch(
  "https://api.cors.syrins.tech/?url=https://example.com/api"
);
console.log(await yanit.json());
```

### **2) Header'lı POST isteği**

```javascript
const cevap = await fetch(
  "https://api.cors.syrins.tech/?url=https://example.com/login",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kullanici: "deneme", sifre: "1234" })
  }
);
console.log(await cevap.json());
```

---

## ⚙ Backend Özeti (TR)

* Node.js + TypeScript
* SSRF koruması (IP + hostname)
* Rate limit + abuse koruması
* Redis / memory cache
* İstek tekilleştirme
* Hedef bazlı devre kesici
* `/health`, `/live`, `/ready`
* `/metrics` ve `/metrics/prometheus`

---

## 🎨 Frontend Özeti (TR)

* React 18 + Vite
* Tailwind CSS + shadcn/ui
* TR/EN çift dilli arayüz
* Canlı Playground
* Durum/Health ekranı
* Hazır kopyalanabilir örnekler

---

# 📬 Support / Destek

Sorular, öneriler veya katkılar için **issue** açabilirsiniz.

---

# 🧭 Footer Navigation

<p align="center">
  <a href="https://github.com/Syrins/Cors-Bridge">Home</a> •
  <a href="https://github.com/Syrins/Cors-Bridge/tree/main/Frontend">Frontend</a> •
  <a href="https://github.com/Syrins/Cors-Bridge/tree/main/Backend">Backend</a> •
  <a href="https://cors.syrins.tech">Live Service</a>
  <br/><br/>
  <sub>© Cors-Bridge — Modern, Secure & Developer-Focused CORS Platform</sub>
</p>
```

---

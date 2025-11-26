# 🌉 **Cors-Bridge**

### Modern • Secure • SSRF-Protected • Full-Stack CORS Proxy Platform

#### **Public API • NPM Package • CLI Tool • React Playground**

> **English README** — *Turkish docs available below (Frontend & Backend)*

<p align="center">
  <a href="https://www.npmjs.com/package/corsbridge">
    <img src="https://img.shields.io/npm/v/corsbridge.svg?style=for-the-badge&logo=npm&logoColor=white" />
  </a>
  <a href="https://www.npmjs.com/package/corsbridge">
    <img src="https://img.shields.io/npm/dm/corsbridge.svg?style=for-the-badge" />
  </a>
  <a href="https://github.com/Syrins/Cors-Bridge/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/Syrins/Cors-Bridge/blob/main/Frontend/docs/English.md">
    <img src="https://img.shields.io/badge/Frontend%20EN-3498DB?style=for-the-badge" />
  </a>
  <a href="https://github.com/Syrins/Cors-Bridge/blob/main/Frontend/docs/Turkish.md">
    <img src="https://img.shields.io/badge/Frontend%20TR-F39C12?style=for-the-badge" />
  </a>
  <a href="https://github.com/Syrins/Cors-Bridge/blob/main/Backend/docs/English.md">
    <img src="https://img.shields.io/badge/Backend%20EN-3498DB?style=for-the-badge" />
  </a>
  <a href="https://github.com/Syrins/Cors-Bridge/blob/main/Backend/docs/Turkish.md">
    <img src="https://img.shields.io/badge/Backend%20TR-F39C12?style=for-the-badge" />
  </a>
</p>


<p align="center">
  <img src="https://share.syrins.tech/images/cors.jpg" width="880" />
</p>

---

# 🇺🇸 English Documentation

# 📘 What Is Cors-Bridge?

**Cors-Bridge** is a **modern, secure, SSRF-protected, full-stack CORS proxy platform** designed by **Syrins** to completely eliminate browser-side CORS issues for developers.

It is not just a single tool — it is a **complete ecosystem** consisting of:

### ✔ **1. Unlimited Public CORS API (no server needed)**

Use instantly:

```
https://api.cors.syrins.tech/?url=<TARGET_URL>
```

### ✔ **2. NPM Package (`corsbridge`)**

Zero-config TypeScript/JavaScript client.

### ✔ **3. CLI Tool**

Perform CORS-safe HTTP requests directly from terminal.

### ✔ **4. Full Backend**

Hardened CORS proxy with SSRF protections, caching, circuit breakers, metrics, health checks.

### ✔ **5. Frontend Playground**

React/Vite UI with examples, request tester, live latency, health dashboard.

---

# 🚀 Key Features

### 🔒 **SSRF Protection**

* DNS + IP verification
* Private subnet blocking
* Blacklisted IP ranges
* Safe URL validator
* Prevents localhost & internal network access

### ⚙ **Advanced Proxy Engine**

* Automatic header passthrough
* Request & response normalization
* Timeout & rate-limit
* In-flight request deduplication
* Per-host circuit breaker
* Raw/JSON output modes

### ⚡ **Caching System**

* Memory cache (default)
* Optional Redis 7+
* Cache-key hashing
* Override TTL support

### 📊 **Observability**

* `/metrics` Prometheus endpoint
* `/live`, `/ready`, `/health`
* Latency tracking
* Error counters

### 🧪 **Developer Experience**

* React playground
* Ready code snippets
* NPM + CLI + API all in sync
* TypeScript-first design

---

# 🌍 Free Unlimited Public CORS API

### **No server setup required. Free forever. Production-ready.**

Use immediately:

```
https://api.cors.syrins.tech/?url=<TARGET_URL>
```

### 👍 Benefits

* Zero installation
* Unlimited usage
* Fast global routing
* Works in fetch(), Axios, etc.
* CORS-safe
* SSRF-protected
* Perfect for frontend apps

### Example

```js
const response = await fetch(
  "https://api.cors.syrins.tech/?url=https://example.com"
);
console.log(await response.json());
```

---

# 📦 NPM Package — `corsbridge`

install:

```bash
npm install corsbridge
```

### Quick Usage

```ts
import { corsFetch } from "corsbridge";

const data = await corsFetch("https://api.github.com/users/github");

console.log(data);
```

### Highlights

* 7.3 KB gzipped
* TypeScript-native
* Works in Browser + Node
* Automatic error normalization
* Built-in security

---

# 🖥 CLI Tool — Global CORS Requester

Install globally:

```bash
npm install -g corsbridge
```

### Basic Request

```bash
corsbridge https://example.com
```

### POST Example

```bash
corsbridge https://example.com/login \
  --method POST \
  --header "Content-Type: application/json" \
  --data '{"user":"admin","pass":"1234"}'
```

### Output Modes

```bash
corsbridge https://api.github.com/users/github --json
corsbridge https://example.com --raw
```

### Save to File

```bash
corsbridge https://example.com/data --out data.json
```

### All Flags

| Flag        | Description         |
| ----------- | ------------------- |
| `--method`  | HTTP method         |
| `--header`  | Add custom header   |
| `--data`    | JSON/String body    |
| `--json`    | Pretty JSON         |
| `--raw`     | Raw response        |
| `--agent`   | User-Agent          |
| `--timeout` | Timeout ms          |
| `--out`     | Save output         |
| `--no-ssl`  | Skip SSL validation |

---

# ⚙ Backend Architecture

### ✔ Node.js + TypeScript

### ✔ Koa/Express-style middleware

### ✔ SSRF Guard (IP + DNS + RegExp validation)

### ✔ Redis caching

### ✔ Circuit breaker per host

### ✔ Metrics

### ✔ Health checks

### ✔ Full logs + tracing

### ✔ Public and private deployment support

Backend English docs →
**[https://github.com/Syrins/Cors-Bridge/blob/main/Backend/docs/English.md](https://github.com/Syrins/Cors-Bridge/blob/main/Backend/docs/English.md)**

Backend Turkish docs →
**[https://github.com/Syrins/Cors-Bridge/blob/main/Backend/docs/Turkish.md](https://github.com/Syrins/Cors-Bridge/blob/main/Backend/docs/Turkish.md)**

---

# 🎨 Frontend Playground

* React 18 + Vite
* Tailwind + shadcn/ui
* Dark/light mode
* EN/TR bilingual
* Live request tester
* Health monitor
* Status charts

Frontend English docs →
**[https://github.com/Syrins/Cors-Bridge/blob/main/Frontend/docs/English.md](https://github.com/Syrins/Cors-Bridge/blob/main/Frontend/docs/English.md)**

Frontend Turkish docs →
**[https://github.com/Syrins/Cors-Bridge/blob/main/Frontend/docs/Turkish.md](https://github.com/Syrins/Cors-Bridge/blob/main/Frontend/docs/Turkish.md)**

---

# 🔎 Comparison vs Other CORS Services

*(Updated with all weaknesses + your unlimited public API)*

| Feature             | Cors-Bridge            | CORS Anywhere | AllOrigins | WhateverOrigin | ScraperAPI | RapidAPI CORS |
| ------------------- | ---------------------- | ------------- | ---------- | -------------- | ---------- | ------------- |
| Public Hosted API   | ✔ Unlimited free       | ✔ Unstable    | ✔ Free     | ✔ Free         | ✖ Paid     | ✖ Paid        |
| SSRF Protection     | ✔ Strong               | ✖ Weak        | ✖ None     | ✖ None         | ✔ Strong   | ✔ Strong      |
| Private IP Blocking | ✔ Yes                  | ✖ No          | ✖ No       | ✖ No           | ✔ Yes      | ✔ Yes         |
| URL Sanitization    | ✔ Advanced             | ✖ Basic       | ✖ Basic    | ✖ Basic        | ✔ Strong   | ✔ Strong      |
| Caching             | ✔ Redis/Memory         | ✖ None        | ✖ Weak     | ✖ Weak         | ✔ Yes      | ✔ Yes         |
| In-Flight Dedup     | ✔ Yes                  | ✖ No          | ✖ No       | ✖ No           | ✖ No       | ✖ No          |
| Circuit Breaker     | ✔ Yes                  | ✖ No          | ✖ No       | ✖ No           | ✔ Yes      | ✔ Yes         |
| Playground          | ✔ Yes                  | ✖ No          | ✖ No       | ✖ No           | ✖ No       | ✔ Partial     |
| Rate Limit          | ✔ Built-in             | ✖ No          | ✖ No       | ✖ No           | ✔ Strong   | ✔ Strong      |
| JSONP               | ✖ No                   | ✔ Yes         | ✔ Yes      | ✔ Yes          | ✖ No       | ✖ No          |
| Free Tier           | ✔ Unlimited            | ✔ Yes         | ✔ Yes      | ✔ Yes          | ✖ No       | ✖ No          |
| Requires Server     | ✖ Public API available | ✖ No          | ✖ No       | ✖ No           | ✔ Yes      | ✔ Yes         |

### ✔ Strengths (Honest)

* Free unlimited public API
* Enterprise-level SSRF protection
* Caching, deduplication, metrics
* CLI + NPM + Playground
* Fully modern TS codebase
* Developer-first design

---

# 🛡️ Service Reliability, SLA & Limitations (Honest + Professional)

Cors-Bridge is designed to be highly available, fault-tolerant and safe by default.
Below is an **honest, transparent and professional overview** of service guarantees and limitations.

---

## 📌 Service Availability (SLA-Style Statement)

Cors-Bridge commits to maintaining a **high-availability, multi-region CORS infrastructure** with:

* Continuous uptime target aligned with **industry-standard reliability**
  *(no fixed percentage such as 99.9% or 99.99% is formally guaranteed)*
* Automated monitoring and self-recovery
* Multi-node architecture to minimize downtime
* Zero-downtime deployment strategy
* Automatic restarts on failures

> ⚠ *While Cors-Bridge aims for extremely high uptime, it does not provide a legally binding SLA at this time.*

---

## 🌐 Multi-Region Redundancy (Active-Active)

Cors-Bridge is **not** single-region.
It operates across **multiple independent regions and runtimes**:

### ✔ **2 High-Availability Backend Machines**

Physical/virtual servers located in separate datacenters.

### ✔ **1 Cloudflare Worker Edge Instance**

Global edge fallback for ultra-low latency.

### ✔ **1 Additional Edge Provider (Render / Vercel / etc.)**

Third-party failover for automatic routing.

### ✔ **Automatic failover logic**

If one backend becomes unreachable, requests are transparently routed to the next healthy region.

> Result: **Full multi-region failover**, extremely low risk of total outage.

---

## 🧩 Cluster & Load Balancing Support

Cors-Bridge backend supports:

* Horizontal scaling
* Cluster mode (multi-process Node.js)
* Load balancer compatibility
* Multi-instance deployments
* Cache sync via Redis (optional)

> This ensures stable performance even under heavy load.

---

## ⚡ High-Traffic Behavior (Realistic Breakdown)

Cors-Bridge is optimized for heavy workloads, but **traffic patterns matter**.
The engine divides load into safe, isolated segments:

### **1. Per-Host Circuit Breaker**

If a specific external API becomes slow/unusable, only that host is isolated —
**other traffic flows normally**.

### **2. In-Flight Request Deduplication**

Duplicate simultaneous requests merge into a **single upstream call**, reducing CPU load.

### **3. Intelligent Timeout Management**

Slow remote servers cannot block the event-loop
→ Requests auto-expire safely.

### **4. Caching Layers (Memory + Redis)**

Hot endpoints are served in microseconds, drastically reducing upstream load.

### **5. Smooth Burst Handling**

Small traffic spikes are absorbed without causing rate-limit storms or CPU spikes.

---

## 💰 Free Public API Sustainability

Although Cors-Bridge offers an **unlimited free public API**, its sustainability is ensured because:

* Infrastructure is provided through a **hosting partner in which the author is a co-owner**
* Costs are predictable and optimized
* Multi-region backend + worker infrastructure ensures stability
* Abuse prevention mechanisms help control load

> Therefore, unlike many “free CORS proxies”, sustainability and funding **are not a risk** here.

---

## 🚫 No Single-Region Failure Risk

Cors-Bridge previously could have had single-region dependency —
**but the current architecture eliminates this entirely.**

* Multiple backend regions
* Cloudflare Worker Edge fallback
* Additional global proxy provider
* Health-based multi-origin routing

> Translation: **No single point of failure.**

---

## 🔐 Security Boundaries (Transparent Limitations)

Cors-Bridge implements strong protections, but (like all proxies) has some inherent limitations:

* Does not provide JSONP (by design, security risk)
* Cannot bypass target API’s own rate-limits or anti-bot systems
* Cannot control slow or down remote servers
* High-security WAF/IDS features (advanced threat models) belong to the enterprise tier, not default tier

---

# 📬 Support / Issues / Contributions

We welcome:

* Feature requests
* Bug reports
* Pull requests
* Suggestions

---

# 🧭 Footer Navigation

<p align="center">
  <a href="https://github.com/Syrins/Cors-Bridge">Home</a> •
  <a href="https://github.com/Syrins/Cors-Bridge/tree/main/Frontend">Frontend</a> •
  <a href="https://github.com/Syrins/Cors-Bridge/tree/main/Backend">Backend</a> •
  <a href="https://cors.syrins.tech">Public API</a>
  <br/><br/>
  <sub>© Cors-Bridge — Secure, Modern, Developer-First CORS Platform by Syrins</sub>
</p>

---


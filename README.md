# 🤖 ChatBot App  

Kullanıcılarla etkileşim kurabilen, mesaj geçmişini saklayan ve gerektiğinde Google üzerinden arama yapabilen bir **React tabanlı ChatBot uygulaması**.  

🌐 Canlı Demo: [chit-chat.com.tr](https://chit-chat.com.tr/)  

<img width="800" height="530" alt="zFyehuD9hab (1) (1)" src="https://github.com/user-attachments/assets/a1661e9c-184e-4594-8f54-5789786b923a" />



## 🚀 Özellikler  
- 💬 Gerçek zamanlı sohbet  
- 😊 Emoji desteği (Emoji Mart)  
- 📂 Sohbet geçmişi ve çoklu chat yönetimi (LocalStorage ile)  
- 🔎 Google API entegrasyonu ile web araması  
- 🧠 OpenAI API entegrasyonu (chat completions)  
- 📱 Responsive tasarım (mobil uyumlu arayüz)  

## 🛠️ Kullanılan Teknolojiler  
- React.js  
- OpenAI API  
- Google Custom Search API  
- LocalStorage  
- Emoji Mart  
- CSS  

## 📦 Kurulum  

Projeyi kendi bilgisayarında çalıştırmak için:  

```bash
# Repoyu klonla
git clone https://github.com/kullanici-adi/chatbot-app.git

# Proje klasörüne gir
cd chatbot-app

# Bağımlılıkları yükle
npm install

# Uygulamayı başlat
npm run dev

## 🔑 Ortam Değişkenleri
Projenin çalışması için .env dosyası oluşturup aşağıdaki değişkenleri eklemelisin:

VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_GOOGLE_CX=your_google_custom_search_cx


# استفاده از تصویر پایه Node.js
FROM node:18

# تنظیم دایرکتوری کار
WORKDIR /app

# کپی کردن فایل‌های پروژه
COPY package*.json ./

# نصب وابستگی‌ها
RUN npm install

# کپی کردن تمام فایل‌های پروژه
COPY . .

# در معرض قرار دادن پورت
EXPOSE 3000

# دستور اجرای اپلیکیشن
CMD ["npm", "start"]

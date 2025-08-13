FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    poppler-utils \
    libgl1 \
    wget \
    gnupg \
    xvfb \
    x11-utils \
    x11-xserver-utils \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libasound2 \
    libgtk-3-0 \
    libgdk-pixbuf-xlib-2.0-0 \
    libxcursor1 \
    libxi6 \
    libxext6 \
    libxfixes3 \
    dbus-x11 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN playwright install chromium

RUN apt-get update && apt-get install -y \
    fonts-liberation \
    fonts-dejavu-core \
    fonts-unifont \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN echo '#!/bin/bash\n\
set -e\n\
cleanup() {\n\
    pkill Xvfb 2>/dev/null || true\n\
    rm -f /tmp/.X99-lock /tmp/.X11-unix/X99 2>/dev/null || true\n\
    exit 0\n\
}\n\
trap cleanup SIGTERM SIGINT EXIT\n\
pkill Xvfb 2>/dev/null || true\n\
rm -f /tmp/.X99-lock /tmp/.X11-unix/X99 2>/dev/null || true\n\
Xvfb :99 -screen 0 1920x1080x24 -ac +extension GLX +render -noreset -dpi 96 &\n\
XVFB_PID=$!\n\
sleep 5\n\
if ! kill -0 $XVFB_PID 2>/dev/null; then\n\
    exit 1\n\
fi\n\
export DISPLAY=:99\n\
if ! xdpyinfo -display :99 >/dev/null 2>&1; then\n\
    exit 1\n\
fi\n\
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level warning' > /start.sh

RUN chmod +x /start.sh

ENV DISPLAY=:99
EXPOSE 8000

CMD ["/start.sh"]

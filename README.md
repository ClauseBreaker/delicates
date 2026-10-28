# Delicates — деплой GitHub → Hetzner
1. Сервер (один раз): `apt install -y nginx rsync certbot python3-certbot-nginx`, `mkdir -p /var/www/delicates`,
   положить deploy/nginx.conf в /etc/nginx/sites-available/delicates, включить симлинком в sites-enabled, `nginx -t && systemctl reload nginx`,
   затем `certbot --nginx -d ваш-домен` (HTTPS).
2. Ключ (на своём компьютере): `ssh-keygen -t ed25519 -f deploy_key -N ""`; содержимое deploy_key.pub добавить на сервер в ~/.ssh/authorized_keys пользователя деплоя.
3. GitHub → Settings → Secrets and variables → Actions → добавить: HETZNER_HOST (IP), HETZNER_USER, HETZNER_PATH (/var/www/delicates), HETZNER_SSH_KEY (содержимое файла deploy_key целиком).
4. Любой push в main автоматически выкладывает сайт на сервер. Запуск вручную: вкладка Actions → Deploy to Hetzner → Run workflow.

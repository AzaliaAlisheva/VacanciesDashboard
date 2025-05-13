# Straight to production with Nginx
FROM nginx:alpine

# Copy your static files
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Use this nginx config for single-page apps
COPY nginx.template.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
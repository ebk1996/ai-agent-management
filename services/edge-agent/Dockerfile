FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8081
WORKDIR /app
COPY app.py ./app.py
RUN useradd --system --uid 10001 --create-home appuser
USER 10001
EXPOSE 8081
CMD ["python", "app.py"]

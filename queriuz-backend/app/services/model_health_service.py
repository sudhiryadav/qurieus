import os
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import threading
from typing import Optional
from app.core.config import settings

class ModelHealthMonitor:
    def __init__(self):
        self.last_check_time = datetime.now()
        self.model_status = True
        self.notification_sent = False
        self.check_interval = 300  # 5 minutes
        self.monitor_thread: Optional[threading.Thread] = None
        self.stop_monitoring = False

    def start_monitoring(self):
        """Start the monitoring thread"""
        if self.monitor_thread is None or not self.monitor_thread.is_alive():
            self.stop_monitoring = False
            self.monitor_thread = threading.Thread(target=self._monitor_loop)
            self.monitor_thread.daemon = True
            self.monitor_thread.start()

    def stop_monitoring(self):
        """Stop the monitoring thread"""
        self.stop_monitoring = True
        if self.monitor_thread:
            self.monitor_thread.join()

    def _monitor_loop(self):
        """Main monitoring loop"""
        while not self.stop_monitoring:
            try:
                self._check_model_health()
                time.sleep(self.check_interval)
            except Exception as e:
                print(f"Error in model health monitoring: {str(e)}")

    def _check_model_health(self):
        """Check if the embedding model is available"""
        from app.services.document_service import embedding_model
        
        current_status = embedding_model is not None
        self.last_check_time = datetime.now()

        # If model status changed to unavailable
        if self.model_status and not current_status:
            self.model_status = False
            self.notification_sent = False
            self._send_notification("Model Unavailable", 
                "The document embedding model has become unavailable. Please check the system.")

        # If model status changed to available
        elif not self.model_status and current_status:
            self.model_status = True
            self._send_notification("Model Available", 
                "The document embedding model is now available again.")

    def _send_notification(self, subject: str, message: str):
        """Send email notification to admin"""
        try:
            admin_email = settings.ADMIN_EMAIL
            if not admin_email:
                print("Warning: ADMIN_EMAIL not set in environment variables")
                return

            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_FROM_EMAIL
            msg['To'] = admin_email
            msg['Subject'] = f"[Queriuz] {subject}"

            body = f"""
            Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            
            {message}
            
            System: Queriuz Document Processing
            Environment: {settings.ENVIRONMENT}
            """

            msg.attach(MIMEText(body, 'plain'))

            # Send email using SMTP
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                    server.starttls()
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)

            print(f"Notification sent to {admin_email}: {subject}")
            self.notification_sent = True

        except Exception as e:
            print(f"Failed to send notification email: {str(e)}")

    def get_status(self) -> dict:
        """Get current model health status"""
        return {
            "model_available": self.model_status,
            "last_check": self.last_check_time.isoformat(),
            "notification_sent": self.notification_sent
        }

# Create a singleton instance
model_health_monitor = ModelHealthMonitor() 
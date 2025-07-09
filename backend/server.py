#!/usr/bin/env python3

import json
import random
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time

class EmotionAnalysisHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        """Handle POST requests for emotion analysis"""
        if self.path == '/analyze':
            try:
                # Get content length
                content_length = int(self.headers.get('Content-Length', 0))
                
                # Read the request body
                post_data = self.rfile.read(content_length).decode('utf-8')
                
                # Parse JSON data
                data = json.loads(post_data)
                text = data.get('text', '').strip()
                
                if not text:
                    self.send_error_response(400, 'Text input is required')
                    return
                
                # Simulate processing time
                time.sleep(1)
                
                # Mock emotion analysis
                emotion_result = self.analyze_emotion(text)
                
                # Send successful response
                self.send_json_response(200, emotion_result)
                
            except json.JSONDecodeError:
                self.send_error_response(400, 'Invalid JSON format')
            except Exception as e:
                self.send_error_response(500, f'Server error: {str(e)}')
        else:
            self.send_error_response(404, 'Endpoint not found')

    def analyze_emotion(self, text):
        """Mock emotion analysis logic"""
        # Simple keyword-based emotion detection
        emotions = {
            'anxious': ['nervous', 'worried', 'anxious', 'scared', 'afraid', 'stressed'],
            'happy': ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love'],
            'sad': ['sad', 'depressed', 'down', 'upset', 'disappointed', 'hurt'],
            'angry': ['angry', 'mad', 'frustrated', 'annoyed', 'furious', 'hate'],
            'calm': ['calm', 'peaceful', 'relaxed', 'content', 'serene', 'balanced'],
            'confident': ['confident', 'strong', 'capable', 'ready', 'determined', 'proud']
        }
        
        text_lower = text.lower()
        detected_emotions = []
        
        for emotion, keywords in emotions.items():
            for keyword in keywords:
                if keyword in text_lower:
                    detected_emotions.append(emotion)
                    break
        
        # If no emotion detected, assign a random one
        if not detected_emotions:
            detected_emotions = [random.choice(list(emotions.keys()))]
        
        # Pick the first detected emotion
        primary_emotion = detected_emotions[0]
        
        # Generate confidence score based on text length and keywords
        base_confidence = 0.6 + (len(text) / 1000) * 0.2  # Longer text = higher confidence
        keyword_bonus = len(detected_emotions) * 0.1
        confidence = min(0.95, base_confidence + keyword_bonus + random.uniform(-0.1, 0.1))
        
        return {
            'emotion': primary_emotion.title(),
            'confidence': round(confidence, 2),
            'analysis': self.get_emotion_analysis(primary_emotion),
            'suggestions': self.get_suggestions(primary_emotion)
        }
    
    def get_emotion_analysis(self, emotion):
        """Get analysis text for each emotion"""
        analyses = {
            'anxious': "Your reflection shows signs of anxiety. This is a natural response to new or challenging situations.",
            'happy': "Your reflection radiates positivity and joy. It's wonderful to see you in such a good emotional state.",
            'sad': "Your reflection indicates sadness. Remember that it's okay to feel this way, and these feelings are temporary.",
            'angry': "Your reflection shows anger or frustration. These are valid emotions that signal something needs attention.",
            'calm': "Your reflection demonstrates a peaceful state of mind. This inner calm is valuable for well-being.",
            'confident': "Your reflection shows confidence and self-assurance. This positive mindset will serve you well."
        }
        return analyses.get(emotion, "Your reflection shows a complex emotional state that's worth exploring further.")
    
    def get_suggestions(self, emotion):
        """Get suggestions for each emotion"""
        suggestions = {
            'anxious': ["Try deep breathing exercises", "Break challenges into smaller steps", "Talk to someone you trust"],
            'happy': ["Share your joy with others", "Take time to appreciate this moment", "Use this energy for something positive"],
            'sad': ["Allow yourself to feel these emotions", "Reach out to supportive friends", "Consider what might help you feel better"],
            'angry': ["Take time to cool down", "Identify the root cause", "Express your feelings constructively"],
            'calm': ["Maintain this peaceful state", "Share your calm energy with others", "Use this clarity for decision-making"],
            'confident': ["Channel this confidence into action", "Help others feel empowered", "Set ambitious but achievable goals"]
        }
        return suggestions.get(emotion, ["Take time for self-reflection", "Consider talking to someone", "Practice self-care"])

    def send_json_response(self, status_code, data):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        response = json.dumps(data, indent=2)
        self.wfile.write(response.encode('utf-8'))

    def send_error_response(self, status_code, message):
        """Send error response"""
        error_data = {
            'error': True,
            'message': message,
            'status': status_code
        }
        self.send_json_response(status_code, error_data)

    def log_message(self, format, *args):
        """Override to reduce logging noise"""
        pass

def run_server():
    """Run the HTTP server"""
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, EmotionAnalysisHandler)
    print(f"🧠 Emotion Analysis API running on http://localhost:8000")
    print("📝 Available endpoint: POST /analyze")
    print("🔍 Send JSON: {\"text\": \"your reflection here\"}")
    print("=" * 50)
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
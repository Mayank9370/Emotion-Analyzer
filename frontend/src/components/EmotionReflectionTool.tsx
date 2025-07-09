import React, { useState } from 'react';
import { Brain, Send, Loader2, Heart, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';

interface EmotionResult {
  emotion: string;
  confidence: number;
  analysis: string;
  suggestions: string[];
}

interface ApiResponse {
  emotion: string;
  confidence: number;
  analysis: string;
  suggestions: string[];
  error?: boolean;
  message?: string;
}

const EmotionReflectionTool: React.FC = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EmotionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Please enter your reflection before submitting.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() }),
      });

      const data: ApiResponse = await response.json();

      if (data.error) {
        setError(data.message || 'An error occurred while analyzing your reflection.');
      } else {
        setResult({
          emotion: data.emotion,
          confidence: data.confidence,
          analysis: data.analysis,
          suggestions: data.suggestions,
        });
      }
    } catch (err) {
      setError('Unable to connect to the analysis service. Please make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      anxious: 'from-orange-400 to-red-500',
      happy: 'from-yellow-400 to-green-500',
      sad: 'from-blue-400 to-indigo-500',
      angry: 'from-red-400 to-red-600',
      calm: 'from-green-400 to-blue-500',
      confident: 'from-purple-400 to-pink-500',
    };
    return colors[emotion.toLowerCase() as keyof typeof colors] || 'from-gray-400 to-gray-600';
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojis = {
      anxious: '😰',
      happy: '😊',
      sad: '😢',
      angry: '😠',
      calm: '😌',
      confident: '💪',
    };
    return emojis[emotion.toLowerCase() as keyof typeof emojis] || '🤔';
  };

  const resetForm = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <Brain className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Emotion Reflection Tool
          </h1>
          <p className="text-gray-600 text-lg">
            Share your thoughts and discover insights about your emotional state
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <label 
              htmlFor="reflection" 
              className="block text-sm font-semibold text-gray-700 mb-3"
            >
              How are you feeling today? What's on your mind?
            </label>
            <textarea
              id="reflection"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="I feel nervous about my first job interview..."
              className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {text.length}/1000 characters
              </span>
              <div className="flex gap-3">
                {(result || error) && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading || !text.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Emotion Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className={`bg-gradient-to-r ${getEmotionColor(result.emotion)} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{getEmotionEmoji(result.emotion)}</span>
                      <h2 className="text-2xl font-bold">{result.emotion}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-lg font-medium">
                        {Math.round(result.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  <Heart className="w-8 h-8 opacity-80" />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  Analysis
                </h3>
                <p className="text-gray-700 leading-relaxed">{result.analysis}</p>
              </div>
            </div>

            {/* Suggestions Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Suggestions for You
              </h3>
              <div className="space-y-3">
                {result.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-gray-500 text-sm">
            This tool provides general emotional insights and is not a substitute for professional mental health care.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmotionReflectionTool;
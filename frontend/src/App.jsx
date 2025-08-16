import React, { useState } from "react";
import axios from "axios";


const App = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [transcript, setTranscript] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [editableSummary, setEditableSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [newRecipient, setNewRecipient] = useState("");
  const [subject, setSubject] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setTranscript("");

      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        setTranscript(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcript.trim() && !selectedFile) {
      setError("Please provide a transcript or upload a file");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      } else {
        formData.append("transcript", transcript);
      }
      formData.append("customPrompt", customPrompt);

      const response = await axios.post(
        `${BACKEND_URL}/api/summarize`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSummary(response.data.summary);
        setEditableSummary(response.data.summary);
        setShowShare(true);
        setSuccess("Summary generated successfully!");
      }
    } catch (error) {
      setError(error.response?.data?.error || "Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecipient = () => {
    if (newRecipient.trim() && !recipients.includes(newRecipient.trim())) {
      setRecipients([...recipients, newRecipient.trim()]);
      setNewRecipient("");
    }
  };

  const handleRemoveRecipient = (email) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

  const handleShare = async () => {
    if (recipients.length === 0) {
      setError("Please add at least one recipient");
      return;
    }

    if (!editableSummary.trim()) {
      setError("Summary cannot be empty");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${BACKEND_URL}/api/share`, {
        recipients,
        subject: subject || "Meeting Summary Shared",
        summary: editableSummary,
      });

      if (response.data.success) {
        setSuccess("Summary shared successfully!");
        setRecipients([]);
        setSubject("");
        setNewRecipient("");
      }
    } catch (error) {
      setError(error.response?.data?.error || "Failed to share summary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAddRecipient();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Meeting Notes Summarizer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload transcripts, generate AI summaries, and share with your team
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Input Transcript
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File (Text or PDF)
            </label>
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                accept=".txt,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
              >
                <span className="text-gray-600">
                  {selectedFile
                    ? selectedFile.name
                    : "Click to upload or drag and drop"}
                </span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Paste Transcript Directly
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your meeting transcript here..."
              disabled={selectedFile !== null}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              rows="6"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Instructions (Optional)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., 'Summarize in bullet points for executives' or 'Highlight only action items'"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            />
          </div>

          <button
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={handleGenerateSummary}
            disabled={isLoading || (!transcript.trim() && !selectedFile)}
          >
            {isLoading ? "Generating..." : "Generate Summary"}
          </button>
        </div>

        {summary && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Generated Summary
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edit Summary (if needed)
              </label>
              <textarea
                value={editableSummary}
                onChange={(e) => setEditableSummary(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="15"
              />
            </div>
            <button
              className="bg-gray-600 text-white py-2 px-4 rounded-md font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              onClick={() => setEditableSummary(summary)}
            >
              Reset to Original
            </button>
          </div>
        )}

        {showShare && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Share Summary
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Meeting Summary - [Date]"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipients
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="recipient@example.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  className="bg-gray-600 text-white py-2 px-4 rounded-md font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  onClick={handleAddRecipient}
                >
                  Add
                </button>
              </div>
            </div>

            {recipients.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {recipients.map((email, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{email}</span>
                      <button
                        onClick={() => handleRemoveRecipient(email)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className="w-full bg-green-600 text-white py-3 px-6 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={handleShare}
              disabled={isLoading || recipients.length === 0}
            >
              {isLoading ? "Sharing..." : "Share Summary"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

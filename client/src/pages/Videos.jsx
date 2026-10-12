
import { useEffect, useRef, useState } from "react";

const VIDEO_API = import.meta.env.VITE_VIDEO_LAMBDA_URL;
const CHUNK_SIZE = 5 * 1024 * 1024;

export default function Videos() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  async function callLambda(data) {
    if (!VIDEO_API) {
      throw new Error("VITE_VIDEO_LAMBDA_URL is missing from client/.env.");
    }

    const response = await fetch(VIDEO_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error(`Invalid server response (${response.status}).`);
    }

    if (!response.ok) {
      throw new Error(result.error || `Request failed (${response.status}).`);
    }

    return result;
  }

  async function loadVideos(showMessage = false) {
    setLoadingVideos(true);

    try {
      const result = await callLambda({ action: "list" });
      setVideos(result.videos || []);

      if (showMessage) {
        setMessage("Gallery refreshed successfully.");
        setMessageType("success");
      }
    } catch (error) {
      setMessage("Could not load videos: " + error.message);
      setMessageType("error");
    } finally {
      setLoadingVideos(false);
    }
  }

  useEffect(() => {
    loadVideos();
  }, []);

  async function uploadVideo(event) {
    event.preventDefault();

    if (!file) {
      setMessage("Please select a video first.");
      setMessageType("error");
      return;
    }

    if (!file.type.startsWith("video/") || file.size === 0) {
      setMessage("Please select a valid, non-empty video file.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setProgress(0);
    setMessage("Preparing upload...");
    setMessageType("info");

    let uploadDetails = null;
    let completed = false;

    try {
      uploadDetails = await callLambda({
        action: "create",
        filename: file.name,
        contentType: file.type,
      });

      const parts = [];
      const totalParts = Math.ceil(file.size / CHUNK_SIZE);

      for (let i = 0; i < totalParts; i++) {
        const partNumber = i + 1;
        const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

        setMessage(`Uploading chunk ${partNumber} of ${totalParts}...`);

        const signed = await callLambda({
          action: "signPart",
          key: uploadDetails.key,
          uploadId: uploadDetails.uploadId,
          partNumber,
        });

        const uploadResponse = await fetch(signed.url, {
          method: "PUT",
          body: chunk,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Chunk ${partNumber} failed (${uploadResponse.status}).`);
        }

        const etag = uploadResponse.headers.get("ETag");
        if (!etag) {
          throw new Error("S3 did not expose ETag. Check bucket CORS settings.");
        }

        parts.push({ PartNumber: partNumber, ETag: etag });
        setProgress(Math.round(((i + 1) / totalParts) * 100));
      }

      setMessage("Finalizing video...");

      await callLambda({
        action: "complete",
        key: uploadDetails.key,
        uploadId: uploadDetails.uploadId,
        parts,
      });

      completed = true;
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";

      setMessage("Video uploaded successfully!");
      setMessageType("success");
      await loadVideos();
    } catch (error) {
      if (uploadDetails?.uploadId && !completed) {
        try {
          await callLambda({
            action: "abort",
            key: uploadDetails.key,
            uploadId: uploadDetails.uploadId,
          });
        } catch {
          // Preserve the original upload error.
        }
      }

      setMessage("Upload failed: " + error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  const formatSize = (bytes) =>
    bytes ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : "0 MB";

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "";

  return (
    <main className="videos-page">
      <style>{`
        .videos-page {
          min-height: 100vh;
          padding: 32px;
          background: #f7f9fc;
          color: #1f2937;
          font-family: inherit;
        }
        .videos-container { max-width: 1150px; margin: 0 auto; }
        .videos-header {
          display: flex; justify-content: space-between;
          align-items: center; gap: 18px; flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .videos-header h1 {
          margin: 0 0 8px; font-size: 30px; color: #1e3a5f;
        }
        .videos-header p { margin: 0; color: #64748b; line-height: 1.6; }
        .videos-count {
          background: #eaf2ff; color: #2563eb;
          padding: 10px 15px; border-radius: 10px;
          font-size: 14px; font-weight: 600;
        }
        .videos-panel {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 14px; padding: 24px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, .04);
          margin-bottom: 34px;
        }
        .videos-panel h2 { margin: 0 0 8px; font-size: 20px; color: #1e3a5f; }
        .videos-panel p { color: #64748b; line-height: 1.6; }
        .videos-file {
          display: block; width: 100%; margin: 16px 0;
          padding: 12px; border: 1px solid #dbe3ee;
          border-radius: 8px; background: #f8fafc;
          color: #334155;
        }
        .videos-btn {
          padding: 11px 17px; border-radius: 8px;
          border: 1px solid transparent; cursor: pointer;
          font-size: 14px; font-weight: 600; transition: background .15s;
        }
        .videos-btn:disabled { opacity: .55; cursor: not-allowed; }
        .videos-btn-primary { background: #2563eb; color: white; }
        .videos-btn-primary:hover:not(:disabled) { background: #1d4ed8; }
        .videos-btn-secondary {
          color: #2563eb; background: #fff; border-color: #bfdbfe;
        }
        .videos-btn-secondary:hover:not(:disabled) { background: #eff6ff; }
        .videos-progress { margin: 16px 0; }
        .videos-progress progress { width: 100%; accent-color: #2563eb; }
        .videos-message {
          padding: 12px 14px; margin: 15px 0;
          border-radius: 8px; overflow-wrap: anywhere; font-size: 14px;
        }
        .videos-message.info { background: #eff6ff; color: #1d4ed8; }
        .videos-message.success { background: #f0fdf4; color: #166534; }
        .videos-message.error { background: #fef2f2; color: #b91c1c; }
        .videos-section-header {
          display: flex; justify-content: space-between;
          align-items: center; gap: 15px; flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .videos-section-header h2 { margin: 0; color: #1e3a5f; font-size: 23px; }
        .videos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }
        .videos-card {
          overflow: hidden; background: white;
          border: 1px solid #e2e8f0; border-radius: 12px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, .04);
        }
        .videos-player {
          display: block; width: 100%; aspect-ratio: 9 / 14;
          background: #111827; object-fit: contain;
        }
        .videos-card-info { padding: 14px; }
        .videos-card-title {
          margin: 0 0 10px; font-size: 14px; font-weight: 600;
          color: #334155; overflow-wrap: anywhere;
        }
        .videos-card-meta {
          display: flex; justify-content: space-between;
          flex-wrap: wrap; gap: 8px; color: #64748b; font-size: 12px;
        }
        .videos-empty {
          grid-column: 1 / -1; text-align: center;
          padding: 50px 20px; background: white;
          border: 1px dashed #cbd5e1; border-radius: 12px;
        }
        .videos-empty-icon { font-size: 34px; color: #3b82f6; margin-bottom: 12px; }
        .videos-empty h3 { color: #334155; margin: 0 0 8px; }
        .videos-empty p { color: #64748b; margin: 0; line-height: 1.6; }
        @media (max-width: 600px) {
          .videos-page { padding: 20px 14px; }
          .videos-panel { padding: 18px; }
          .videos-header h1 { font-size: 25px; }
        }
      `}</style>

      <div className="videos-container">
        <header className="videos-header">
          <div>
            <h1>Video Gallery</h1>
            <p>Upload, manage, and watch your videos in one place.</p>
          </div>
          <div className="videos-count">
            {videos.length} {videos.length === 1 ? "video" : "videos"}
          </div>
        </header>

        <section className="videos-panel">
          <h2>Upload a video</h2>
          <p>
            Select a video from your device. The file will be uploaded in
            separate 5 MB chunks.
          </p>

          <form onSubmit={uploadVideo}>
            <input
              ref={inputRef}
              className="videos-file"
              type="file"
              accept="video/*"
              disabled={loading}
              onChange={(event) => {
                setFile(event.target.files?.[0] || null);
                setMessage("");
              }}
            />

            {file && (
              <p>
                {file.name} · {formatSize(file.size)}
              </p>
            )}

            {loading && (
              <div className="videos-progress">
                <p>{message}</p>
                <progress value={progress} max="100" />
                <span>{progress}%</span>
              </div>
            )}

            {message && (
              <div className={`videos-message ${messageType}`} role="status">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="videos-btn videos-btn-primary"
              disabled={loading || !file}
            >
              {loading ? "Uploading..." : "↑ Upload video"}
            </button>
          </form>
        </section>

        <section>
          <div className="videos-section-header">
            <h2>Your videos</h2>
            <button
              type="button"
              className="videos-btn videos-btn-secondary"
              onClick={() => loadVideos(true)}
              disabled={loading || loadingVideos}
            >
              {loadingVideos ? "Loading..." : "Refresh videos"}
            </button>
          </div>

          <div className="videos-grid">
            {loadingVideos && videos.length === 0 ? (
              <div className="videos-empty">
                <div className="videos-empty-icon">◌</div>
                <h3>Loading videos</h3>
                <p>Connecting to your video gallery...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="videos-empty">
                <div className="videos-empty-icon">▷</div>
                <h3>No videos uploaded yet</h3>
                <p>Your uploaded videos will appear here.</p>
              </div>
            ) : (
              videos.map((video) => (
                <article className="videos-card" key={video.key}>
                  <video
                    className="videos-player"
                    controls
                    playsInline
                    preload="metadata"
                    src={video.playbackUrl}
                  />
                  <div className="videos-card-info">
                    <p className="videos-card-title">
                      {video.key.split("/").pop()}
                    </p>
                    <div className="videos-card-meta">
                      <span>{formatSize(video.size)}</span>
                      <span>{formatDate(video.lastModified)}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}



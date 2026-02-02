import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

const OCRScanner = ({ onScanComplete }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const imgRef = useRef(null);
    const [aspect, setAspect] = useState(undefined) // Free crop by default

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined) // Makes crop preview update between images
            const reader = new FileReader();
            reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onImageLoad = (e) => {
        if (aspect) {
            const { width, height } = e.currentTarget
            setCrop(centerAspectCrop(width, height, aspect))
        }
    }

    const getCroppedImg = async (image, crop) => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                blob.name = 'cropped.jpeg';
                resolve(window.URL.createObjectURL(blob));
            }, 'image/jpeg');
        });
    };

    const handleProcessOCR = async () => {
        if (!imgRef.current || !completedCrop) {
            alert("Silakan upload dan crop gambar terlebih dahulu.");
            return;
        }

        setLoading(true);
        setProgress(0);

        try {
            const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop);

            const result = await Tesseract.recognize(
                croppedImageUrl,
                'eng',
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            setProgress(parseInt(m.progress * 100));
                        }
                    },
                }
            );

            const text = result.data.text;
            console.log("OCR Result:", text);

            const numbers = text.match(/\d+/g);
            let likelyKm = "";
            if (numbers) {
                const candidate = numbers.find(n => n.length >= 4 && n.length <= 7);
                likelyKm = candidate ? candidate : numbers[0];
            }

            onScanComplete(likelyKm || "");

        } catch (error) {
            console.error("OCR Error:", error);
            alert("Terjadi kesalahan saat memproses OCR.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all hover:border-primary/20">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Digital Scan</h2>
                        <p className="text-sm font-medium text-slate-500">Upload & Crop Odometer Photo</p>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="form-control w-full mb-8">
                    <label className="group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer bg-slate-50/50 hover:bg-white hover:border-primary/40 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="w-12 h-12 mb-4 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors border border-slate-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                                </svg>
                            </div>
                            <p className="mb-1 text-sm text-slate-600 font-bold">Select Odometer Photo</p>
                            <p className="text-xs text-slate-400 font-medium italic">JPG, PNG supported</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={onSelectFile} />
                    </label>
                </div>

                {imageSrc && (
                    <div className="space-y-6">
                        <div className="rounded-[2rem] overflow-hidden border-4 border-slate-50 bg-slate-900 flex justify-center shadow-2xl">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspect}
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={imageSrc}
                                    onLoad={onImageLoad}
                                    className="max-h-[450px] object-contain opacity-90 hover:opacity-100 transition-opacity"
                                />
                            </ReactCrop>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                className={`btn btn-primary btn-lg flex-1 rounded-2xl shadow-lg shadow-primary/20 border-none transition-all active:scale-[0.98] ${loading ? 'btn-disabled' : ''}`}
                                onClick={handleProcessOCR}
                                disabled={!imageSrc || loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <span className="loading loading-spinner loading-md"></span>
                                        <span className="font-bold tracking-wide italic">Analyzing {progress}%</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 justify-center p-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a3 3 0 013-3V3a1 1 0 112 0v1a5 5 0 00-10 0V4a3 3 0 01-3 3v4a3 3 0 11-6 0V7a5 5 0 0110 0v4a1 1 0 11-2 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-bold text-center tracking-tight">Run Intelligent Scan</span>
                                    </div>
                                )}
                            </button>
                            {imageSrc && !loading && (
                                <button className="btn btn-ghost btn-lg rounded-2xl text-slate-400" onClick={() => setImageSrc(null)}>
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OCRScanner;

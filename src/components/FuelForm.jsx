import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const FuelForm = ({ scannedKm, activeType = 'bbm' }) => {
    const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm({
        defaultValues: {
            tanggal: new Date().toISOString().split('T')[0],
            prev_kilometer: localStorage.getItem('last_odometer') || '',
            kilometer: '',
            liter: '',
            harga: '',
            jenis_oli: '',
            aksi: 'Ganti', // Default action for oil
            catatan: ''
        }
    });

    // Handle tab switch - update type but keep common fields
    useEffect(() => {
        // Reset doesn't change common fields like tanggal and kilometer
    }, [activeType]);

    useEffect(() => {
        if (scannedKm) {
            setValue('kilometer', scannedKm);
        }
    }, [scannedKm, setValue]);

    const onSubmit = async (data) => {
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZfDz7TmytH0pVH_fiaquHKquSabIn0okZsm3bwSKUexlN37OtYwCkKeTivFwx05Qr/exec";

        let payload = {
            type: activeType,
            tanggal: data.tanggal,
            kilometer: Number(data.kilometer)
        };

        if (activeType === 'bbm') {
            payload = {
                ...payload,
                liter: Number(data.liter),
                harga: Number(data.harga)
            };
        } else {
            payload = {
                ...payload,
                jenis_oli: data.jenis_oli,
                aksi: data.aksi,
                catatan: data.catatan
            };
        }

        try {
            await axios.post(GOOGLE_SCRIPT_URL, JSON.stringify(payload), {
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                }
            });

            localStorage.setItem('last_odometer', data.kilometer);
            alert(`Data ${activeType.toUpperCase()} berhasil disimpan!`);
            // Optionally reset specific fields after success
            if (activeType === 'bbm') {
                setValue('liter', '');
                setValue('harga', '');
            } else {
                setValue('jenis_oli', '');
                setValue('catatan', '');
            }
        } catch (error) {
            console.error("Submission Error:", error);
            alert("Gagal menyimpan data. Periksa koneksi atau konfigurasi script.");
        }
    };

    const liter = watch('liter');
    const harga = watch('harga');
    const km = watch('kilometer');
    const prevKm = watch('prev_kilometer');

    const pricePerLiter = (liter && harga) ? (harga / liter).toFixed(0) : 0;
    const kmPerLiter = (km && prevKm && liter && (Number(km) > Number(prevKm))) ? ((Number(km) - Number(prevKm)) / Number(liter)).toFixed(2) : 0;

    return (
        <div className={`bg-white rounded-[2rem] sm:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all ${activeType === 'oli' ? 'border-secondary/20' : 'border-primary/20'}`}>
            <div className={`p-6 sm:p-8 border-b border-slate-50 ${activeType === 'oli' ? 'bg-secondary/5' : 'bg-primary/5'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${activeType === 'oli' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                        {activeType === 'bbm' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">{activeType === 'bbm' ? 'Fuel Refill' : 'Oil Maintenance'}</h2>
                        <p className="text-xs sm:text-sm font-medium text-slate-500">{activeType === 'bbm' ? 'Track gas station transactions' : 'Log oil checks and replacements'}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 sm:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div className="form-control w-full uppercase">
                            <label className="label-text mb-2.5 font-black text-[10px] tracking-[0.2em] text-slate-400 ml-1">Date</label>
                            <input
                                type="date"
                                {...register("tanggal", { required: true })}
                                className="input h-14 w-full bg-slate-50 border-slate-200 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700"
                            />
                        </div>

                        <div className="form-control w-full uppercase">
                            <label className="label-text mb-2.5 font-black text-[10px] tracking-[0.2em] text-slate-400 ml-1">Current Odometer (KM)</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    placeholder="Enter mileage"
                                    {...register("kilometer", { required: true })}
                                    className="input h-14 bg-slate-50 border-slate-200 rounded-2xl w-full pl-14 font-black text-slate-800 placeholder:text-slate-300"
                                />
                                <div className="absolute left-5 top-4.5 text-slate-300 group-focus-within:text-primary transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conditional Fields Based on Type */}
                    {activeType === 'bbm' ? (
                        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                <div className="form-control w-full uppercase">
                                    <label className="label-text mb-2.5 font-black text-[10px] tracking-[0.2em] text-slate-400 ml-1">Previous Odometer</label>
                                    <input
                                        type="number"
                                        placeholder="Last session KM"
                                        {...register("prev_kilometer")}
                                        className="input h-14 bg-slate-50 border-slate-200 rounded-2xl p-4 w-full font-bold text-slate-600 italic"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-control w-full uppercase">
                                        <label className="label-text mb-2.5 font-black text-[10px] tracking-[0.2em] text-slate-400 ml-1">Volume (L)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...register("liter", { required: true })}
                                            className="input h-14 bg-slate-50 border-slate-200 p-4 rounded-2xl font-black text-slate-800 placeholder:text-slate-300"
                                        />
                                    </div>
                                    <div className="form-control w-full uppercase">
                                        <label className="label-text mb-2.5 font-black text-[10px] tracking-[0.2em] text-slate-400 ml-1">Total (IDR)</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            {...register("harga", { required: true })}
                                            className="input h-14 bg-slate-50 border-slate-200 p-4 rounded-2xl font-black text-slate-800 placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50">
                                {pricePerLiter > 0 && (
                                    <div className="px-5 py-2.5 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-2.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                                        <span className="text-xs font-black text-green-700 uppercase tracking-widest leading-none">
                                            Rp {Number(pricePerLiter).toLocaleString('id-ID')} / Liter
                                        </span>
                                    </div>
                                )}
                                {kmPerLiter > 0 && (
                                    <div className="px-5 py-2.5 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-2.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                        <span className="text-xs font-black text-blue-700 uppercase tracking-widest leading-none">
                                            {kmPerLiter} KM / Liter
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                <div className="form-control w-full uppercase">
                                    <label className="label-text mb-2.5 font-black text-[10px] tracking-[0.2em] text-slate-400 ml-1">Jenis Oli</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Shell Advance 10W-40"
                                        {...register("jenis_oli", { required: activeType === 'oli' })}
                                        className="input h-14 bg-slate-50 border-slate-200 p-4 rounded-2xl font-bold text-slate-800 placeholder:text-slate-300"
                                    />
                                </div>
                                <div className="form-control w-full uppercase">
                                    <label className="label-text mb-2.5 font-black text-[10px] tracking-[0.2em] text-slate-400 ml-1">Aksi Maintenance</label>
                                    <select
                                        {...register("aksi")}
                                        className="select h-14 bg-slate-50 border-slate-200 rounded-2xl font-bold text-slate-800"
                                    >
                                        <option value="Ganti">🔄 Ganti Baru</option>
                                        <option value="Cek">🔍 Pengecekan</option>
                                        <option value="Tambah">➕ Penambahan</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-control w-full uppercase">
                                <label className="label-text mb-2.5 font-black text-[10px] tracking-[0.2em] text-slate-400 ml-1">Catatan</label>
                                <textarea
                                    placeholder="Catatan tambahan..."
                                    {...register("catatan")}
                                    className="textarea bg-slate-50 border-slate-200 rounded-2xl p-4 font-medium text-slate-700 h-24"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-6 pt-6">
                        <button
                            type="submit"
                            className={`btn btn-lg sm:w-auto w-full px-16 rounded-2xl shadow-xl transition-all active:scale-[0.98] border-none font-black tracking-tight uppercase ${activeType === 'oli' ? 'btn-secondary shadow-secondary/20' : 'btn-primary shadow-primary/20'} ${isSubmitting ? 'btn-disabled' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-3">
                                    <span className="loading loading-spinner loading-md"></span>
                                    <span>Syncing...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Sync to Cloud</span>
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FuelForm;

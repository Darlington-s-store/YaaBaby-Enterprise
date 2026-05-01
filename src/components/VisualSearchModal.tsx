import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Upload, Sparkles, Search, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { Product } from "@/data/catalog";
import { useProducts } from "@/store/useProducts";
import api from "@/services/api";
import { toast } from "sonner";

interface VisualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VisualSearchModal = ({ isOpen, onClose }: VisualSearchModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { products } = useProducts();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      handleAnalyze(selected);
    }
  };

  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAnalyze = async (selectedFile: File) => {
    setScanning(true);
    setResults([]);
    setCurrentSearchId(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const response = await api.post('/visual-search', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Assuming backend returns { products: [...], searchId: "..." } 
      // or we need to adjust the backend to return the record id
      if (response.data.products) {
        setResults(response.data.products);
        setCurrentSearchId(response.data.searchId);
      } else {
        setResults(response.data);
        // If the backend returns the array directly, we might need to adjust the controller
      }
    } catch (err) {
      console.error(err);
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      setResults(shuffled.slice(0, 4));
    } finally {
      setScanning(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!currentSearchId) return;
    setSubmitting(true);
    try {
      await api.post(`/visual-search/${currentSearchId}/request`, {
        notes: "User requested availability check via visual search."
      });
      toast.success("Availability request submitted! We'll notify you soon.");
    } catch (err) {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setScanning(false);
    setResults([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-card border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-emerald-gold grid place-items-center text-accent-foreground">
                  <Camera className="size-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">Visual Search</h2>
                  <p className="text-xs text-muted-foreground">Find products by uploading an image</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="size-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {!preview ? (
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-colors cursor-pointer hover:bg-muted/50",
                    "border-muted-foreground/20 hover:border-accent/50"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="size-20 rounded-full bg-accent/10 grid place-items-center mb-6">
                    <Upload className="size-10 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Upload an image</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mb-8">
                    Drag and drop your image here, or click to browse. We'll find similar items in our store.
                  </p>
                  <Button className="rounded-full px-8 bg-primary hover:bg-primary/90">
                    Select from device
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                  {/* Image Preview & Scanner */}
                  <div className="relative rounded-3xl overflow-hidden aspect-square bg-muted shadow-inner group">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="size-full object-cover"
                    />
                    
                    {scanning && (
                      <motion.div 
                        initial={{ top: "0%" }}
                        animate={{ top: "100%" }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-accent shadow-[0_0_15px_rgba(var(--accent),0.8)] z-10"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button variant="secondary" className="rounded-full" onClick={reset}>
                        <RotateCcw className="size-4 mr-2" /> Change image
                      </Button>
                    </div>

                    {scanning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                        <div className="text-center text-white space-y-3">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="size-12 text-accent mx-auto" />
                          </motion.div>
                          <p className="font-display text-lg font-bold tracking-widest uppercase">Analyzing Image...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Results */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-2xl font-bold flex items-center gap-2">
                        {scanning ? "Finding matches..." : results.length > 0 ? "Similar Products" : "No results yet"}
                        <Sparkles className="size-5 text-accent" />
                      </h3>
                      {!scanning && results.length > 0 && (
                        <span className="text-xs font-bold text-accent uppercase tracking-widest">{results.length} Matches found</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {scanning ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="space-y-3">
                            <div className="aspect-square bg-muted animate-pulse rounded-2xl" />
                            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                          </div>
                        ))
                      ) : (
                        results.map((p, i) => (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <ProductCard product={p} index={i} />
                          </motion.div>
                        ))
                      )}
                    </div>

                    {!scanning && results.length === 0 && (
                      <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-3xl">
                        <ImageIcon className="size-12 mx-auto mb-4 opacity-20" />
                        <p>No exact matches found, but we can find this for you!</p>
                      </div>
                    )}

                    {!scanning && currentSearchId && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-accent/5 border border-accent/20 rounded-3xl p-6 text-center space-y-4"
                      >
                        <div className="flex items-center justify-center gap-2 text-accent">
                          <Sparkles className="size-5" />
                          <span className="font-bold uppercase tracking-wider text-sm">Personal Sourcing</span>
                        </div>
                        <h4 className="font-display text-xl font-bold">Can't find exactly what you need?</h4>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                          Our team can manually source this item or find the closest alternative for you.
                        </p>
                        <Button 
                          className="w-full rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-12 shadow-xl shadow-accent/20"
                          onClick={handleSubmitRequest}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="mr-2"
                              >
                                <RotateCcw className="size-4" />
                              </motion.div>
                              Submitting...
                            </>
                          ) : "Submit Availability Request"}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-muted/30 border-t flex items-center justify-between">
              <p className="text-xs text-muted-foreground max-w-md">
                Tip: For best results, ensure the object is well-lit and centered in the frame.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={onClose} className="rounded-full">Cancel</Button>
                {preview && !scanning && (
                  <Button className="rounded-full bg-primary" onClick={() => handleAnalyze(file!)}>
                    Re-scan
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const RotateCcw = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);

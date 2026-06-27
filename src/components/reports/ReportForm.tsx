import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IncidentType,
  SeverityLevel,
  incidentTypeConfig,
  severityLabels,
} from "@/types";
import {
  MapPin,
  Upload,
  Camera,
  Mic,
  Waves,
  CloudRain,
  CloudLightning,
  Thermometer,
  Trash2,
  Wind,
  Droplets,
  AlertTriangle,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Locate,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/utils/supabase";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/utils/useAuthStore";
import { toast } from "sonner";
import axios from "axios";

const iconMap = {
  Waves,
  CloudRain,
  CloudLightning,
  Thermometer,
  Trash2,
  Wind,
  Droplets,
  AlertTriangle,
};

const waterDepthOptions = [
  { value: "ankle", label: "Ankle deep (~15cm)" },
  { value: "knee", label: "Knee deep (~45cm)" },
  { value: "waist", label: "Waist deep (~100cm)" },
  { value: "above", label: "Above waist (>100cm)" },
];

const infrastructureOptions = [
  "Road blocked",
  "Bridge damaged",
  "House flooded",
  "Power outage",
  "Vehicles stranded",
  "Trees fallen",
  "Other",
];

interface Media {
  public_id: string;
  url: string;
  type: string;
}

export function ReportForm() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [incidentType, setIncidentType] = useState<IncidentType | null>(null);
  const [severity, setSeverity] = useState<SeverityLevel | null>(null);
  const [description, setDescription] = useState("");
  const [waterDepth, setWaterDepth] = useState("");
  const [infrastructure, setInfrastructure] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);

  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [media, setMedia] = useState<Media[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     setMediaFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  //   }
  //   e.target.value = "";
  // };

  useEffect(() => {
    const searchAddress = async () => {
      if (addressQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=5`,
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch address suggestions:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchAddress, 500);
    return () => clearTimeout(timeoutId);
  }, [addressQuery]);

  const getLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation({
            lat,
            lng,
            name: "Detecting address...",
          });

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            );
            const data = await res.json();
            const displayName = data.display_name || "Unknown Location";
            setLocation({
              lat,
              lng,
              name: displayName,
            });
            setAddressQuery(displayName);
          } catch (error) {
            setLocation({
              lat,
              lng,
              name: "Location found (Address lookup failed)",
            });
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLocating(false);
        },
      );
    } else {
      setIsLocating(false);
    }
  };

  const isFloodRelated = incidentType === "flood" || incidentType === "rain";

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const payload = {
    incident_type: incidentType,
    location_name: location?.name,
    latitude: location?.lat,
    longitude: location?.lng,
    infrastructure,
    water_depth: waterDepth,
    description,
    severity,
    user_name: user?.name,
  };

  const uploadMedia = async () => {
    setIsUploadLoading(true);
    const formData = new FormData();

    mediaFiles.forEach((media) => {
      formData.append("media", media);
    });

    try {
      const response = await axios.post(
        "https://coflare-backend-xdl5.onrender.com/api/upload/",
        //"http://localhost:3000/api/upload",
        formData,
      );

      toast.success("Media upload successful");
      setIsUploadLoading(false);
      setMedia(response.data.data);
    } catch (error) {
      setIsUploadLoading(false);
      toast.error("Media upload failed");
    }
  };

  const submit = async () => {
    setIsLoading(true);

    const { success, error } = await supabase
      .from("reports")
      .insert([{ ...payload, media, user_id: user.id ?? null }]);

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    if (success) {
      toast.success("Report sent successfully");
      setIsLoading(false);

      setTimeout(() => {
        navigate("/my-reports");
      }, 500);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto overflow-hidden">
      {}
      <div className="h-1 bg-muted">
        <motion.div
          className="h-full gradient-hero"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Report an Incident</CardTitle>
          <span className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pb-8">
        {}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Label className="text-base mb-4 block">
              What type of incident are you reporting?
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(incidentTypeConfig) as IncidentType[]).map(
                (type) => {
                  const config = incidentTypeConfig[type];
                  const IconComponent =
                    iconMap[config.icon as keyof typeof iconMap];
                  const isSelected = incidentType === type;

                  return (
                    <button
                      key={type}
                      onClick={() => setIncidentType(type)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-left hover:shadow-md",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
                          `incident-${type}`,
                        )}
                      >
                        {IconComponent && <IconComponent size={20} />}
                      </div>
                      <p className="font-medium text-sm">{config.label}</p>
                    </button>
                  );
                },
              )}
            </div>
          </motion.div>
        )}

        {}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label className="text-base mb-4 block">
                How severe is this incident?
              </Label>
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5] as SeverityLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setSeverity(level)}
                    className={cn(
                      "flex-1 py-4 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                      severity === level
                        ? "border-primary shadow-md"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full",
                        `severity-${level}`,
                      )}
                    />
                    <span className="font-medium">{level}</span>
                    <span className="text-xs text-muted-foreground">
                      {severityLabels[level]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-base mb-2 block">
                Describe what you're seeing
              </Label>
              <Textarea
                id="description"
                placeholder="Provide details about the incident..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            {isFloodRelated && (
              <div>
                <Label className="text-base mb-3 block">
                  Water depth (optional)
                </Label>
                <RadioGroup value={waterDepth} onValueChange={setWaterDepth}>
                  <div className="grid grid-cols-2 gap-3">
                    {waterDepthOptions.map((option) => (
                      <div
                        key={option.value}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                          waterDepth === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50",
                        )}
                        onClick={() => setWaterDepth(option.value)}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                        />
                        <Label
                          htmlFor={option.value}
                          className="cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            <div>
              <Label className="text-base mb-3 block">
                Infrastructure impact (optional)
              </Label>
              <div className="flex flex-wrap gap-2">
                {infrastructureOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      setInfrastructure((prev) =>
                        prev.includes(option)
                          ? prev.filter((i) => i !== option)
                          : [...prev, option],
                      )
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition-colors",
                      infrastructure.includes(option)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label className="text-base mb-4 block">
                Where is this happening?
              </Label>
              <Button
                variant="outline"
                className="w-full h-14 gap-3 text-base"
                onClick={getLocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Locate size={20} />
                )}
                {isLocating ? "Detecting location..." : "Use Current Location"}
              </Button>
            </div>

            {location && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-muted flex items-start gap-3"
              >
                <MapPin size={20} className="text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{location.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  or enter manually
                </span>
              </div>
            </div>

            <div className="relative">
              <Label htmlFor="address">Address or landmark</Label>
              <div className="relative">
                <Input
                  id="address"
                  placeholder="e.g., Third Mainland Bridge, Lagos"
                  className="mt-1.5"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground mt-0.5" />
                )}
              </div>
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm border-b last:border-0 transition-colors"
                      onClick={() => {
                        setAddressQuery(suggestion.display_name);
                        setLocation({
                          lat: parseFloat(suggestion.lat),
                          lng: parseFloat(suggestion.lon),
                          name: suggestion.display_name,
                        });
                        setSuggestions([]);
                      }}
                    >
                      {suggestion.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col gap-1">
              <Label className="text-base block">
                Add evidence <span className="text-destructive">*</span>
              </Label>
              <span className="text-sm text-muted-foreground">
                Please upload at least one photo or video before submitting.
              </span>
            </div>

            {/* <input
              type="file"
              accept="image/*,video/*"
              //className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
            /> */}
            {/* <input
              type="file"
              accept="image/*,video/*"
              capture="environment"
              //className="hidden"
              ref={cameraInputRef}
              onChange={handleFileChange}
            /> */}

            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-[4/3]">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files)
                      setMediaFiles((prev) => [
                        ...prev,
                        ...Array.from(e.target.files || []),
                      ]);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                <div className="h-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-3 transition-colors bg-muted/20">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload size={24} className="text-primary" />
                  </div>

                  <div className="text-center">
                    <span className="text-sm font-medium block">
                      Upload Photo
                    </span>
                    <span className="text-xs text-muted-foreground">
                      From Gallery
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => cameraInputRef.current?.click()}
                className="aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-3 transition-colors bg-muted/20"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera size={24} className="text-primary" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium block">Take Photo</span>
                  <span className="text-xs text-muted-foreground">
                    Use Camera
                  </span>
                </div>
              </button>
            </div>

            {mediaFiles.length > 0 ? (
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Uploaded Media ({mediaFiles.length})
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaFiles.map((file, index) => {
                    const previewUrl = URL.createObjectURL(file);

                    return (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden border shadow-sm group"
                      >
                        {file.type.startsWith("video/") ? (
                          <video
                            src={previewUrl}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        )}

                        <button
                          onClick={() => {
                            setMediaFiles((prev) =>
                              prev.filter((_, i) => i !== index),
                            );

                            // cleanup memory
                            URL.revokeObjectURL(previewUrl);
                          }}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-destructive backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-lg bg-muted/50 border border-dashed flex items-center justify-center">
                <p className="text-sm text-center text-muted-foreground">
                  No images uploaded yet. Please add at least one photo.
                </p>
              </div>
            )}

            {mediaFiles.length > 0 && (
              <div className="">
                <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                  <div className="flex items-start gap-3">
                    <Check size={20} className="text-success mt-0.5" />
                    <div>
                      <p className="font-medium text-success">
                        Ready to Submit
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your report will be reviewed by our moderation team.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  className="gap-2 px-8 mt-8"
                  disabled={mediaFiles.length === 0}
                  onClick={uploadMedia}
                >
                  {isUploadLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Upload size={18} />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft size={18} />
            Back
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && !incidentType) ||
                (step === 2 && !severity) ||
                (step === 3 && !location)
              }
              className="gap-2"
            >
              Continue
              <ChevronRight size={18} />
            </Button>
          ) : (
            <Button
              className="gap-2 px-8"
              disabled={media.length === 0}
              onClick={submit}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Check size={18} />
                  Submit Report
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

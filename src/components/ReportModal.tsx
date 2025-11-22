import { useState, useEffect } from "react";
import { AlertTriangle, Upload, Loader2, AlertCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportResponse } from "@/services/reportsService";

interface ReportModalProps {
  open: boolean;
  billingId: number;
  vehicleName: string;
  existingReport?: ReportResponse | null;
  onClose: () => void;
  onSubmit: (
    severity: string,
    note: string,
    imageFiles?: File[]
  ) => Promise<void>;
}

export const ReportModal = ({
  open,
  billingId,
  vehicleName,
  existingReport,
  onClose,
  onSubmit,
}: ReportModalProps) => {
  const [severity, setSeverity] = useState<string>(
    existingReport?.severity || "LOW"
  );
  const [note, setNote] = useState<string>(existingReport?.note || "");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingReport;
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setSeverity(existingReport?.severity || "LOW");
      setNote(existingReport?.note || "");
      const existingUrls = existingReport?.imageUrls || [];
      setExistingImageUrls(existingUrls);
      setImageFiles([]);
      setImagePreviews([]);
      setError(null);
    } else {
      // Reset when closing
      setSeverity("LOW");
      setNote("");
      setExistingImageUrls([]);
      setImagePreviews([]);
      setImageFiles([]);
      setError(null);
    }
  }, [existingReport, open]);
  
  // Determine which images to display
  const displayImages = imageFiles.length > 0 ? imagePreviews : existingImageUrls;
  
  const hasChanges =
    severity !== (existingReport?.severity || "LOW") ||
    note !== (existingReport?.note || "") ||
    imageFiles.length > 0;

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const invalidFiles = files.filter((file) => !file.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      setError("Vui lòng chọn các file hình ảnh");
      return;
    }

    // Validate file sizes (5MB max each)
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError("Kích thước mỗi file không được vượt quá 5MB");
      return;
    }

    // Limit total number of images (e.g., max 5)
    const maxImages = 5;
    if (imageFiles.length + files.length > maxImages) {
      setError(`Tối đa ${maxImages} hình ảnh`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Add files to state
      const newFiles = [...imageFiles, ...files];
      setImageFiles(newFiles);

      // Create previews
      const newPreviews: string[] = [];
      for (const file of files) {
        const reader = new FileReader();
        const promise = new Promise<string>((resolve) => {
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
        newPreviews.push(await promise);
      }
      setImagePreviews([...imagePreviews, ...newPreviews]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi xử lý hình ảnh"
      );
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (!severity) {
      setError("Vui lòng chọn mức độ nghiêm trọng");
      return;
    }

    if (!note.trim()) {
      setError("Vui lòng mô tả vấn đề");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(severity, note, imageFiles.length > 0 ? imageFiles : undefined);
      // Reset form after successful submission (onClose will handle full reset)
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi gửi báo cáo"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "LOW":
        return "bg-blue-50 border-blue-200";
      case "MEDIUM":
        return "bg-amber-50 border-amber-200";
      case "HIGH":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getSeverityLabel = (sev: string) => {
    switch (sev) {
      case "LOW":
        return "Nhẹ - Vấn đề nhỏ";
      case "MEDIUM":
        return "Trung bình - Cần chú ý";
      case "HIGH":
        return "Cao - Vấn đề nghiêm trọng";
      default:
        return "—";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            {isEditing ? "Chỉnh sửa báo cáo vấn đề" : "Báo cáo vấn đề xe"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Cập nhật báo cáo về vấn đề với ${vehicleName}`
              : `Báo cáo bất kỳ vấn đề hoặc hư hỏng nào với ${vehicleName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Severity Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Mức độ nghiêm trọng <span className="text-red-600">*</span>
            </label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger
                className={`${getSeverityColor(
                  severity
                )} border-2 font-medium`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Nhẹ - Vấn đề nhỏ
                  </div>
                </SelectItem>
                <SelectItem value="MEDIUM">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    Trung bình - Cần chú ý
                  </div>
                </SelectItem>
                <SelectItem value="HIGH">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Cao - Vấn đề nghiêm trọng
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Chọn mức độ phù hợp với mức độ nghiêm trọng của vấn đề
            </p>
          </div>

          {/* Report Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Mô tả vấn đề <span className="text-red-600">*</span>
            </label>
            <Textarea
              placeholder="Mô tả chi tiết vấn đề hoặc hư hỏng mà bạn phát hiện (vị trí, loại hư hỏng, tác động, v.v.)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
              maxLength={2000}
              rows={4}
              className="resize-none border-gray-300"
            />
            <p className="text-xs text-gray-500">
              {note.length}/2000 ký tự
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Hình ảnh chứng minh (tùy chọn, tối đa 5 ảnh)
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-fit">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {uploading ? "Đang xử lý..." : "Chọn hình ảnh"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading || submitting || imageFiles.length >= 5}
                  className="hidden"
                />
              </label>
              {displayImages.length > 0 && (
                <div className="space-y-2">
                  {imageFiles.length > 0 && (
                    <p className="text-xs text-gray-500">
                      Hình ảnh mới (sẽ thay thế hình ảnh hiện tại):
                    </p>
                  )}
                  <div className="grid grid-cols-4 gap-3">
                    {displayImages.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full rounded-md object-cover border border-gray-200"
                        />
                        {imageFiles.length > 0 && (
                          <button
                            onClick={() => removeImage(index)}
                            disabled={submitting}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {imageFiles.length === 0 && existingImageUrls.length > 0 && (
                    <p className="text-xs text-gray-500">
                      Chọn hình ảnh mới sẽ thay thế hình ảnh hiện tại
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Severity Info Box */}
          <div
            className={`rounded-lg p-4 border-2 ${getSeverityColor(severity)}`}
          >
            <div className="text-sm">
              <p className="font-semibold text-gray-900">
                {getSeverityLabel(severity)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {severity === "LOW" &&
                  "Vấn đề nhỏ như trầy xước, bụi, v.v. không ảnh hưởng đến an toàn"}
                {severity === "MEDIUM" &&
                  "Vấn đề trung bình cần sửa chữa nhưng vẫn có thể sử dụng xe"}
                {severity === "HIGH" &&
                  "Vấn đề nghiêm trọng ảnh hưởng đến an toàn hoặc không thể sử dụng"}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Report Status (if existing) */}
          {existingReport && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="space-y-1">
                  <div className="font-medium">
                    Trạng thái:{" "}
                    {existingReport.status === "PENDING_REVIEW"
                      ? "⏳ Chờ duyệt"
                      : existingReport.status === "RESOLVED"
                      ? "✅ Đã xử lý"
                      : existingReport.status === "REJECTED"
                      ? "❌ Bị từ chối"
                      : "🔒 Đóng"}
                  </div>
                  {existingReport.status === "PENDING_REVIEW" && (
                    <div className="text-xs text-blue-700">
                      Báo cáo của bạn đang chờ nhân viên kiểm tra
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            {isEditing ? "Hủy" : "Đóng"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              submitting ||
              uploading ||
              !severity ||
              !note.trim() ||
              (isEditing && !hasChanges)
            }
            className={`${
              severity === "HIGH"
                ? "bg-red-600 hover:bg-red-700"
                : severity === "MEDIUM"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : isEditing ? (
              "Cập nhật báo cáo"
            ) : (
              "Gửi báo cáo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

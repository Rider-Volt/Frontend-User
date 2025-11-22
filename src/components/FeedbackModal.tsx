import { useState, useEffect } from "react";
import { Star, Upload, Loader2, AlertCircle, X } from "lucide-react";
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
import type { FeedbackResponse } from "@/services/feedbackService";

interface FeedbackModalProps {
  open: boolean;
  billingId: number;
  vehicleName: string;
  existingFeedback?: FeedbackResponse | null;
  onClose: () => void;
  onSubmit: (rating: number, content: string, imageFiles?: File[]) => Promise<void>;
}

export const FeedbackModal = ({
  open,
  billingId,
  vehicleName,
  existingFeedback,
  onClose,
  onSubmit,
}: FeedbackModalProps) => {
  const [rating, setRating] = useState<number>(existingFeedback?.rating || 0);
  const [content, setContent] = useState<string>(existingFeedback?.content || "");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingFeedback;
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setRating(existingFeedback?.rating || 0);
      setContent(existingFeedback?.content || "");
      const existingUrls = existingFeedback?.imageUrls || [];
      setExistingImageUrls(existingUrls);
      setImageFiles([]);
      setImagePreviews([]);
      setError(null);
    } else {
      // Reset when closing
      setRating(0);
      setContent("");
      setExistingImageUrls([]);
      setImagePreviews([]);
      setImageFiles([]);
      setError(null);
    }
  }, [existingFeedback, open]);
  
  // Determine which images to display
  const displayImages = imageFiles.length > 0 ? imagePreviews : existingImageUrls;

  const hasChanges =
    rating !== (existingFeedback?.rating || 0) ||
    content !== (existingFeedback?.content || "") ||
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
    if (rating === 0) {
      setError("Vui lòng chọn mức đánh giá");
      return;
    }

    if (!content.trim()) {
      setError("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(rating, content, imageFiles.length > 0 ? imageFiles : undefined);
      // Reset form after successful submission (onClose will handle full reset)
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi gửi đánh giá"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa đánh giá" : "Gửi đánh giá về chuyến đi"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Chỉnh sửa đánh giá của bạn về ${vehicleName}`
              : `Chia sẻ trải nghiệm của bạn với ${vehicleName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Mức đánh giá
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                  disabled={submitting}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300 hover:text-amber-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                {rating === 1 && "Rất tệ"}
                {rating === 2 && "Không tốt"}
                {rating === 3 && "Bình thường"}
                {rating === 4 && "Tốt"}
                {rating === 5 && "Rất tốt"}
              </p>
            )}
          </div>

          {/* Feedback Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Nội dung đánh giá
            </label>
            <Textarea
              placeholder="Hãy chia sẻ trải nghiệm của bạn..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              maxLength={1000}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {content.length}/1000 ký tự
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Hình ảnh (tùy chọn, tối đa 5 ảnh)
            </label>
            <div className="space-y-3">
              <label
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-fit"
              >
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

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Approval Status (if existing) */}
          {existingFeedback && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Trạng thái: {existingFeedback.status === "PENDING_REVIEW"
                  ? "Chờ duyệt"
                  : existingFeedback.status === "APPROVED"
                  ? "Đã duyệt"
                  : "Bị từ chối"}
                {existingFeedback.staffNote && (
                  <div className="mt-1 text-xs">
                    Ghi chú: {existingFeedback.staffNote}
                  </div>
                )}
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
              rating === 0 ||
              !content.trim() ||
              (isEditing && !hasChanges)
            }
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : isEditing ? (
              "Cập nhật đánh giá"
            ) : (
              "Gửi đánh giá"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

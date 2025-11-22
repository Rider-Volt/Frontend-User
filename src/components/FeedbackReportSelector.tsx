import { Star, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FeedbackReportSelectorProps {
  open: boolean;
  vehicleName: string;
  onSelectFeedback: () => void;
  onSelectReport: () => void;
  onClose: () => void;
  hasFeedback?: boolean;
  hasReport?: boolean;
}

export const FeedbackReportSelector = ({
  open,
  vehicleName,
  onSelectFeedback,
  onSelectReport,
  onClose,
  hasFeedback,
  hasReport,
}: FeedbackReportSelectorProps) => {
  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {hasFeedback || hasReport ? "Quản lý thông tin" : "Chia sẻ thông tin"}
          </DialogTitle>
          <DialogDescription>
            Chọn hành động bạn muốn thực hiện với {vehicleName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            onClick={onSelectFeedback}
            variant="outline"
            className="w-full h-auto py-4 px-4 justify-start text-left hover:bg-emerald-50 border-emerald-200 hover:border-emerald-300"
          >
            <div className="flex gap-3 items-start w-full">
              <Star className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">
                  {hasFeedback ? "Chỉnh sửa đánh giá" : "Gửi đánh giá"}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {hasFeedback
                    ? "Cập nhật đánh giá của bạn về chuyến đi"
                    : "Chia sẻ trải nghiệm với xe này"}
                </p>
              </div>
            </div>
          </Button>

          <Button
            onClick={onSelectReport}
            variant="outline"
            className="w-full h-auto py-4 px-4 justify-start text-left hover:bg-red-50 border-red-200 hover:border-red-300"
          >
            <div className="flex gap-3 items-start w-full">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">
                  {hasReport ? "Chỉnh sửa báo cáo" : "Báo cáo vấn đề"}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {hasReport
                    ? "Cập nhật báo cáo về vấn đề xe"
                    : "Báo cáo hư hỏng hoặc vấn đề"}
                </p>
              </div>
            </div>
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full text-gray-600 hover:text-gray-900"
        >
          Đóng
        </Button>
      </DialogContent>
    </Dialog>
  );
};

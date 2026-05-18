"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProductReview,
  getProductReviewSummary,
  getProductReviews,
  type ProductReview,
  type ProductReviewSummary,
} from "@/lib/product-review-api";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { useRouteLoading } from "@/components/shared/routing/RouteLoadingProvider";
import { useAuth } from "@/components/shared/auth/AuthProvider";

type ProductReviewsProps = {
  productId?: string;
  reviews: ProductReview[];
  summary?: ProductReviewSummary;
};

type ReviewFormState = {
  rating: number;
  comment: string;
};

const DEFAULT_FORM: ReviewFormState = {
  rating: 5,
  comment: "",
};

const EMPTY_SUMMARY: ProductReviewSummary = {
  averageRating: 0,
  totalReviews: 0,
  ratingCounts: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  },
};

export function ProductReviews({ productId, reviews, summary }: ProductReviewsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { startRouteLoading } = useRouteLoading();
  const { session, user, isAuthenticated, isAuthLoading } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState<ReviewFormState>(DEFAULT_FORM);

  const [reviewsState, setReviewsState] = useState<ProductReview[]>(
    Array.isArray(reviews) ? reviews : [],
  );
  const [summaryState, setSummaryState] = useState<ProductReviewSummary>(
    summary ?? EMPTY_SUMMARY,
  );

  const totalReviews = summaryState.totalReviews;
  const averageRating = summaryState.averageRating;
  const displayAverageRating = totalReviews === 0 ? 5 : averageRating;
  const isAdmin = user?.role === "ADMIN";

  const visibleReviews = useMemo(() => {
    return reviewsState.slice(0, 3);
  }, [reviewsState]);

  const openModal = () => {
    if (isAuthLoading) {
      return;
    }

    if (isAdmin) {
      return;
    }

    if (!isAuthenticated || !session?.access_token) {
      showToast("Vui lòng đăng nhập để đánh giá sản phẩm.", "error");
      startRouteLoading();
      router.push("/login");
      return;
    }

    setMessage(null);
    setIsOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }
    setIsOpen(false);
  };

  const refreshReviews = async () => {
    if (!productId) {
      return;
    }

    const [reviewsResponse, summaryResponse] = await Promise.all([
      getProductReviews(productId),
      getProductReviewSummary(productId),
    ]);

    setReviewsState(reviewsResponse.data);
    setSummaryState(summaryResponse);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const comment = form.comment.trim();
    const rating = Number(form.rating);

    if (!productId) {
      setMessage({ type: "error", text: "Không tìm thấy mã sản phẩm để gửi đánh giá." });
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setMessage({ type: "error", text: "Số sao phải từ 1 đến 5." });
      return;
    }

    if (!comment) {
      setMessage({ type: "error", text: "Vui lòng nhập nội dung đánh giá." });
      return;
    }

    setIsSubmitting(true);
    try {
      await createProductReview(productId, {
        rating,
        comment,
      }, session?.access_token);

      await refreshReviews();

      setMessage({
        type: "success",
        text: "Đánh giá của bạn đã được gửi thành công.",
      });
      showToast("Đánh giá của bạn đã được gửi thành công.", "success");
      setForm(DEFAULT_FORM);

      setTimeout(() => {
        setIsOpen(false);
      }, 800);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Không thể gửi đánh giá. Vui lòng thử lại.";
      if (text.toLowerCase().includes("đã đánh giá")) {
        showToast("Bạn đã đánh giá sản phẩm này rồi.", "error");
        setMessage({ type: "error", text: "Bạn đã đánh giá sản phẩm này rồi." });
      } else {
        showToast(text, "error");
        setMessage({ type: "error", text });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full py-24 border-t border-outline-variant/30">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="flex flex-col gap-3">
          <span className="font-bold text-[12px] tracking-[0.15em] uppercase text-secondary">Đánh giá thực tế</span>
          <h2 className="text-4xl font-serif text-primary">Tiếng Nói Từ Khách Hàng</h2>
          <p className="text-on-surface-variant">Được tin dùng qua nhiều thế hệ.</p>
          <p className="text-sm text-on-surface-variant">
            {displayAverageRating.toFixed(1)} / 5 • {totalReviews} đánh giá
          </p>
        </div>
        {!isAdmin ? (
          <button
            onClick={openModal}
            className="h-14 px-10 border-2 border-primary text-primary font-bold text-xs tracking-widest uppercase rounded-xl hover:bg-primary hover:text-on-primary transition-all"
          >
            VIẾT ĐÁNH GIÁ
          </button>
        ) : null}
      </div>

      {visibleReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visibleReviews.map((review) => (
            <ReviewCard
              key={review.id}
              name={review.reviewerName}
              tag={review.customerLabel}
              quote={review.comment}
              rating={review.rating}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-on-surface-variant">
          Chưa có đánh giá nào cho sản phẩm này.
        </div>
      )}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-outline-variant/30 shadow-xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-serif text-primary">Gửi đánh giá</h3>
                <p className="text-sm text-on-surface-variant mt-1">Đánh giá sẽ hiển thị ngay sau khi gửi.</p>
              </div>
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="text-on-surface-variant hover:text-primary disabled:opacity-50"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <form className="flex flex-col gap-4" onSubmit={submit}>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-primary">Số sao</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= form.rating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, rating: star }))}
                        className={`material-symbols-outlined text-3xl transition-colors ${
                          active ? "text-secondary fill-1" : "text-outline-variant fill-0"
                        }`}
                        aria-label={`${star} sao`}
                      >
                        star
                      </button>
                    );
                  })}
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-primary">Nội dung đánh giá</span>
                <textarea
                  required
                  rows={4}
                  value={form.comment}
                  onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                  className="px-4 py-3 border border-outline-variant/40 rounded-xl focus:outline-none focus:border-primary"
                />
              </label>

              {message ? (
                <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>
                  {message.text}
                </p>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="h-11 px-6 border border-outline-variant/40 rounded-xl text-on-surface hover:bg-surface-container disabled:opacity-60"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 disabled:opacity-60"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ReviewCard({
  name,
  tag,
  quote,
  rating,
}: {
  name: string;
  tag: string;
  quote: string;
  rating: number;
}) {
  const safeRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));

  return (
    <div className="p-10 bg-white border border-outline-variant/30 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-6">
      <div className="flex text-secondary scale-90 origin-left">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`material-symbols-outlined text-sm ${i <= safeRating ? "fill-1" : "fill-0 opacity-40"}`}
          >
            star
          </span>
        ))}
      </div>
      <p className="text-on-surface leading-relaxed italic">&quot;{quote}&quot;</p>
      <div className="flex flex-col gap-1">
        <div className="font-bold text-primary">{name}</div>
        <div className="text-[10px] font-bold text-secondary tracking-widest uppercase">{tag}</div>
      </div>
    </div>
  );
}

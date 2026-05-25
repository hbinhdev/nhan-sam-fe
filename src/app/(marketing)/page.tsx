import Link from "next/link";
import { ProductCard } from "@/components/shared/ProductCard";
import { Hero } from "@/components/sections/home/Hero";
import { Certifications } from "@/components/sections/home/Certifications";
import { CategoryGrid } from "@/components/sections/home/CategoryGrid";
import { BrandHeritage } from "@/components/sections/home/BrandHeritage";
import { Testimonials } from "@/components/sections/home/Testimonials";
import { ConsultationForm } from "@/components/sections/home/ConsultationForm";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { formatCurrencyVND, getBestSellerProducts } from "@/lib/product-api";
import { getCategories, type Category } from "@/lib/category-api";
import { getHomeSections, type HomeSection } from "@/lib/home-section-api";
import { getBlogs, type BlogPostItem } from "@/lib/blog-api";

type HomeSectionSeed = Omit<HomeSection, "id" | "createdAt" | "updatedAt">;

const DEFAULT_SECTIONS: HomeSectionSeed[] = [
  {
    key: "hero",
    type: "HERO",
    title: "Tinh Hoa Sâm Việt Cho Sức Khỏe Vàng",
    subtitle: "Di sản ngàn năm",
    content:
      "Khám phá bí quyết trường thọ từ những củ sâm quý hiếm nhất, được nuôi dưỡng bởi tinh hoa đất trời và kỹ nghệ chế biến truyền thống 50 năm.",
    imageUrl: "/images/hero.png",
    ctaText: "KHÁM PHÁ NGAY",
    ctaLink: "/products",
    dataJson: { secondaryCtaText: "TÌM HIỂU THÊM", secondaryCtaLink: "#heritage" },
    isActive: true,
    sortOrder: 1,
  },
  {
    key: "faq-commitments",
    type: "FAQ_COMMITMENTS",
    title: "Cam Kết Minh Bạch & Chứng Nhận Quốc Tế",
    subtitle: "Chất lượng thượng hạng",
    content:
      "Mọi sản phẩm của Heritage Ginseng đều trải qua quy trình kiểm soát nghiêm ngặt từ vùng trồng tại Hàn Quốc đến nhà máy đạt chuẩn GMP.",
    imageUrl: null,
    ctaText: null,
    ctaLink: null,
    dataJson: {
      items: [
        { icon: "verified", title: "GMP Certified", desc: "Tiêu chuẩn sản xuất tốt" },
        { icon: "workspace_premium", title: "ISO 22000", desc: "An toàn thực phẩm" },
      ],
      images: ["/images/certification.png", "/images/certification.png"],
    },
    isActive: true,
    sortOrder: 2,
  },
  {
    key: "featured-categories",
    type: "FEATURED_CATEGORIES",
    title: "Giải Pháp Sức Khỏe Toàn Diện",
    subtitle: "Chọn sâm theo nhu cầu",
    content: null,
    imageUrl: null,
    ctaText: null,
    ctaLink: null,
    dataJson: {
      items: [
        {
          icon: "elderly",
          title: "Bồi bổ Tuổi Già",
          desc: "Hỗ trợ tăng cường trí nhớ, cải thiện giấc ngủ và làm chậm quá trình lão hóa cho người cao tuổi.",
          usagePurpose: "tuổi già",
        },
        {
          icon: "bolt",
          title: "Năng lượng Bền Bỉ",
          desc: "Giải pháp phục hồi thể lực tức thì, tăng cường sự tập trung cho người làm việc cường độ cao.",
          usagePurpose: "năng lượng",
        },
        {
          icon: "health_and_safety",
          title: "Hỗ trợ Phục Hồi",
          desc: "Thúc đẩy quá trình tái tạo tế bào, nâng cao hệ miễn dịch sau ốm hoặc phẫu thuật.",
          usagePurpose: "phục hồi",
        },
      ],
    },
    isActive: true,
    sortOrder: 3,
  },
  {
    key: "featured-products",
    type: "FEATURED_PRODUCTS",
    title: "Sản Phẩm Bán Chạy Nhất",
    subtitle: "Danh mục ưa chuộng",
    content: null,
    imageUrl: null,
    ctaText: "XEM TẤT CẢ",
    ctaLink: "/products",
    dataJson: null,
    isActive: true,
    sortOrder: 4,
  },
  {
    key: "promo-banners",
    type: "PROMO_BANNERS",
    title: "Ưu Đãi Đặc Biệt Theo Mùa",
    subtitle: "Nhận tư vấn và quà tặng dành cho khách hàng mới.",
    content: null,
    imageUrl: null,
    ctaText: "XEM ƯU ĐÃI",
    ctaLink: "/products",
    dataJson: null,
    isActive: true,
    sortOrder: 5,
  },
  {
    key: "brand-story",
    type: "BRAND_STORY",
    title: "Di Sản Từ Lòng Đất, Sức Sống Từ Tâm",
    subtitle: "Câu chuyện của chúng tôi",
    content:
      "Bắt đầu từ những ngày đầu tiên tìm kiếm nguồn sâm quý tại các thung lũng sương mù Hàn Quốc, Heritage Ginseng đã dành trọn nửa thế kỷ để hoàn thiện quy trình chiết xuất tinh khiết nhất.",
    imageUrl: "/images/heritage.png",
    ctaText: "KHÁM PHÁ HÀNH TRÌNH",
    ctaLink: "#",
    dataJson: { quote: "Hành trình 50 năm gìn giữ tinh hoa." },
    isActive: true,
    sortOrder: 6,
  },
  {
    key: "featured-blogs",
    type: "FEATURED_BLOGS",
    title: "Kiến Thức Chuyên Sâu Về Nhân Sâm",
    subtitle: "Góc chia sẻ",
    content:
      "Khám phá các bài viết mới nhất về cách dùng sâm, lưu ý theo thể trạng và kinh nghiệm chăm sóc sức khỏe bền vững.",
    imageUrl: null,
    ctaText: "XEM BLOG",
    ctaLink: "/blogs",
    dataJson: null,
    isActive: true,
    sortOrder: 7,
  },
  {
    key: "testimonials",
    type: "FAQ_COMMITMENTS",
    title: "Niềm Tin Qua Thế Hệ",
    subtitle: "Chia sẻ từ khách hàng",
    content: null,
    imageUrl: null,
    ctaText: null,
    ctaLink: null,
    dataJson: {
      items: [
        {
          name: "Bác Nguyễn Văn An",
          loc: "Hà Nội",
          quote: "Tôi đã sử dụng Cao Hồng Sâm Heritage trong 3 năm qua. Sức khỏe và tinh thần cải thiện rõ rệt.",
        },
        {
          name: "Chị Mai Phương",
          loc: "TP. Hồ Chí Minh",
          quote: "Các dòng sâm năng lượng của Heritage giúp tôi duy trì sự tỉnh táo suốt cả ngày.",
        },
        {
          name: "Anh Quốc Bảo",
          loc: "Đà Nẵng",
          quote: "Dịch vụ tư vấn chuyên nghiệp, sản phẩm phù hợp làm quà tặng đối tác quan trọng.",
        },
      ],
    },
    isActive: true,
    sortOrder: 8,
  },
  {
    key: "consultation",
    type: "CONSULTATION_SECTION",
    title: "Bạn cần hỗ trợ chọn sản phẩm phù hợp?",
    subtitle:
      "Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng lắng nghe và tư vấn giải pháp sức khỏe tối ưu cho bạn.",
    content:
      "Để lại thông tin để chúng tôi có thể hỗ trợ bạn chọn lựa sản phẩm phù hợp nhất với thể trạng và nhu cầu sức khỏe của bạn.",
    imageUrl: null,
    ctaText: "NHẬN TƯ VẤN NGAY",
    ctaLink: "#consultation",
    dataJson: { formTitle: "Nhận Tư Vấn Từ Chuyên Gia Sâm" },
    isActive: true,
    sortOrder: 9,
  },
];

function buildSectionMap(sections: HomeSection[]) {
  const map = new Map<string, HomeSection>();
  for (const section of sections) {
    map.set(section.key, section);
  }
  return map;
}

function toSection(seed: HomeSectionSeed): HomeSection {
  return {
    ...seed,
    id: `default-${seed.key}`,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  };
}

export default async function Home() {
  let bestSellerProducts: Awaited<
    ReturnType<typeof getBestSellerProducts>
  >["data"] = [];
  let cmsSections: HomeSection[] = [];
  let categories: Category[] = [];
  let latestBlogs: BlogPostItem[] = [];

  try {
    const response = await getBestSellerProducts(4);
    bestSellerProducts = response.data.slice(0, 4);
  } catch {
    bestSellerProducts = [];
  }

  try {
    const blogRes = await getBlogs({ page: 1, limit: 3 });
    latestBlogs = blogRes.data;
  } catch {
    latestBlogs = [];
  }

  try {
    cmsSections = await getHomeSections();
  } catch {
    cmsSections = [];
  }

  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  const cmsMap = buildSectionMap(cmsSections);
  const defaultsMap = new Map(
    DEFAULT_SECTIONS.map((seed) => [seed.key, toSection(seed)]),
  );
  const resolveSection = (key: string) => {
    const cms = cmsMap.get(key);
    if (cms) {
      return cms.isActive ? cms : null;
    }
    return defaultsMap.get(key) ?? null;
  };

  const hero = resolveSection("hero");
  const certifications = resolveSection("faq-commitments");
  const featuredCategories = resolveSection("featured-categories");
  const featuredProducts = resolveSection("featured-products");
  const promoBanners = resolveSection("promo-banners");
  const brandStory = resolveSection("brand-story");
  const featuredBlogs = resolveSection("featured-blogs");
  const testimonials = resolveSection("testimonials");
  const consultation = resolveSection("consultation");

  return (
    <>
      {hero ? (
        <Reveal direction="up">
          <Hero
            title={hero.title}
            subtitle={hero.subtitle}
            content={hero.content}
            imageUrl={hero.imageUrl}
            ctaText={hero.ctaText}
            ctaLink={hero.ctaLink}
            data={hero.dataJson}
          />
        </Reveal>
      ) : null}

      {certifications ? (
        <Reveal direction="left">
          <Certifications
            title={certifications.title}
            subtitle={certifications.subtitle}
            content={certifications.content}
            data={certifications.dataJson}
          />
        </Reveal>
      ) : null}

      {featuredCategories ? (
        <Reveal direction="right">
          <CategoryGrid
            title={featuredCategories.title}
            subtitle={featuredCategories.subtitle}
            categories={categories}
          />
        </Reveal>
      ) : null}

      {featuredProducts ? (
        <section className="w-full py-24 bg-surface-container" id="best-sellers">
          <div className="max-w-[1280px] mx-auto px-6">
            <Reveal direction="up">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div className="flex flex-col gap-3">
                  {featuredProducts.subtitle ? (
                    <span className="font-semibold text-sm tracking-wider text-secondary">
                      {featuredProducts.subtitle}
                    </span>
                  ) : null}
                  {featuredProducts.title ? (
                    <h2 className="text-3xl md:text-4xl font-serif text-primary">
                      {featuredProducts.title}
                    </h2>
                  ) : null}
                </div>
                {featuredProducts.ctaText ? (
                  <Link
                    href={featuredProducts.ctaLink || "/products"}
                    className="text-secondary text-base font-semibold tracking-wide border-b-2 border-secondary pb-1 hover:opacity-70 transition-opacity"
                  >
                    {featuredProducts.ctaText}
                  </Link>
                ) : null}
              </div>
            </Reveal>

            {bestSellerProducts.length > 0 ? (
              <Stagger
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                delayChildren={0.06}
                staggerChildren={0.1}
              >
                {bestSellerProducts.map((product) => (
                  <StaggerItem key={product.id} direction="up">
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={formatCurrencyVND(product.price)}
                      priceValue={product.price}
                      tag={
                        product.ginsengAge ?? product.category?.name ?? undefined
                      }
                      image={
                        product.imageUrl ||
                        product.thumbnail ||
                        "/images/product-root.png"
                      }
                      href={`/products/${product.slug || product.id}`}
                      description={product.shortDescription ?? undefined}
                    />
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <div className="py-10 text-center text-on-surface-variant">
                Chưa có sản phẩm bán chạy.
              </div>
            )}
          </div>
        </section>
      ) : null}

      {promoBanners ? (
        <Reveal direction="up">
          <section className="w-full py-16 bg-primary text-on-primary">
            <div className="max-w-[1280px] mx-auto px-6 text-center">
              {promoBanners.title ? (
                <h2 className="text-3xl font-serif mb-2">{promoBanners.title}</h2>
              ) : null}
              {promoBanners.subtitle ? (
                <p className="opacity-90 mb-6">{promoBanners.subtitle}</p>
              ) : null}
              {promoBanners.ctaText ? (
                <Link
                  href={promoBanners.ctaLink || "#"}
                  className="inline-flex h-12 items-center rounded-lg bg-white px-6 text-sm font-bold text-primary"
                >
                  {promoBanners.ctaText}
                </Link>
              ) : null}
            </div>
          </section>
        </Reveal>
      ) : null}

      {brandStory ? (
        <Reveal direction="left">
          <BrandHeritage
            title={brandStory.title}
            subtitle={brandStory.subtitle}
            content={brandStory.content}
            imageUrl={brandStory.imageUrl}
            ctaText={brandStory.ctaText}
            ctaLink={brandStory.ctaLink}
            data={brandStory.dataJson}
          />
        </Reveal>
      ) : null}

      {featuredBlogs ? (
        <section
          className="w-full pt-10 pb-4 bg-surface-container-low"
          id="featured-blogs"
        >
          <div className="max-w-[1280px] mx-auto px-6 text-center flex flex-col items-center">
            <Reveal direction="up">
              {featuredBlogs.subtitle ? (
                <span className="font-semibold text-sm tracking-wider text-secondary">
                  {featuredBlogs.subtitle}
                </span>
              ) : null}
              {featuredBlogs.title ? (
                <h2 className="mt-3 text-3xl md:text-4xl font-serif text-primary">
                  {featuredBlogs.title}
                </h2>
              ) : null}
              {featuredBlogs.content ? (
                <p className="mx-auto mt-3 max-w-3xl text-on-surface-variant text-sm md:text-base">
                  {featuredBlogs.content}
                </p>
              ) : null}
            </Reveal>

            {latestBlogs.length > 0 && (
              <Stagger
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-left w-full"
                delayChildren={0.07}
                staggerChildren={0.11}
              >
                {latestBlogs.map((blog) => (
                  <StaggerItem key={blog.id} direction="up">
                    <Link
                      href={`/blogs/${blog.slug || blog.id}`}
                      className="flex flex-col bg-white border border-stone-200/60 dark:border-stone-800/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 group"
                    >
                      <div className="aspect-[16/10] relative overflow-hidden bg-stone-50/50">
                        <img
                          src={blog.thumbnail || "/images/blog-placeholder.png"}
                          alt={blog.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        {blog.category && (
                          <span className="absolute top-4 left-4 bg-primary/95 text-on-primary text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded shadow-sm backdrop-blur-sm z-10">
                            {blog.category === "GINSENG_SEO"
                              ? "Kiến thức"
                              : blog.category === "PRODUCT_COMPARISON"
                                ? "So sánh"
                                : "Hướng dẫn"}
                          </span>
                        )}
                      </div>
                      <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                        <div className="flex flex-col gap-1.5">
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-none">
                            {blog.authorName || "Ban biên tập"} •{" "}
                            {blog.publishedAt
                              ? new Date(blog.publishedAt).toLocaleDateString(
                                  "vi-VN",
                                )
                              : "Gần đây"}
                          </p>
                          <h3 className="text-base font-serif font-semibold text-primary leading-snug line-clamp-2 min-h-[44px] group-hover:text-secondary transition-colors duration-300">
                            {blog.title}
                          </h3>
                          {blog.excerpt && (
                            <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 font-normal mt-0.5">
                              {blog.excerpt}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mt-3 border-t border-stone-100 pt-2.5">
                          Đọc bài viết{" "}
                          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform duration-300">
                            arrow_forward
                          </span>
                        </span>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            )}

            {featuredBlogs.ctaText ? (
              <Reveal direction="up" delay={0.08}>
                <Link
                  href={featuredBlogs.ctaLink || "/blogs"}
                  className="mt-6 inline-flex h-11 items-center rounded-lg border border-primary px-6 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-all duration-300"
                >
                  {featuredBlogs.ctaText}
                </Link>
              </Reveal>
            ) : null}
          </div>
        </section>
      ) : null}

      {testimonials ? (
        <Reveal direction="right">
          <Testimonials
            title={testimonials.title}
            subtitle={testimonials.subtitle}
            data={testimonials.dataJson}
          />
        </Reveal>
      ) : null}

      {consultation ? (
        <ConsultationForm
          cms={{
            ctaTitle: consultation.title,
            ctaSubtitle: consultation.subtitle,
            ctaButtonText: consultation.ctaText,
            formTitle:
              typeof consultation.dataJson?.formTitle === "string"
                ? consultation.dataJson.formTitle
                : null,
            formSubtitle: consultation.content,
          }}
        />
      ) : null}
    </>
  );
}

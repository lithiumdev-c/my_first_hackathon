import React from "react";
import assets from "../assets/assets";

const features = [
  {
    title: "Магазин городских бонусов",
    description:
      "Интерактивный каталог, где накопленные баллы мгновенно обмениваются на QR-коды на скидки, бесплатный проезд или услуги партнеров.",
    image: assets.ecostore,
    imagePosition: "left",
  },
  {
    title: "AI-сканер отходов",
    description:
      "Система через камеру распознает тип вторсырья и автоматически начисляет баллы, подтверждая реальность эко-действия.",
    image: assets.ai_scan,
    imagePosition: "right",
  },
];

const Features = ({ theme }) => {
  return (
    <section
      id="features"
      className="py-16 sm:py-20 px-10 sm:px-6 lg:px-8 relative bg-white dark:bg-black"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-b from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Наши особенности
            </span>
          </h2>
        </div>
        <div className="space-y-16 sm:space-y-20 lg:space-y-32">
          {features.map((feature, key) => (
            <div
              key={key}
              className={`flex flex-col lg:flex-row items-center gap-8
            sm:gap-12 ${
              feature.imagePosition === "right" ? "lg:flex-row-reverse" : ""
            }`}
            >
              <div className="flex-1 w-full">
                <div className="relative group">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20
                    rounded-xl sm:rounded-2xl transition-all duration-500"
                  />
                  <div
                    className="relative bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm 
                    border border-gray-300 dark:border-gray-700/50
                    rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden
                    group-hover:border-green-600/50 transition duration-300"
                  >
                    <div className="bg-gray-100 dark:bg-gray-950 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-3 sm:mb-4">
                        <span className="text-gray-600 dark:text-gray-400 ml-2 sm:ml-4 text-xs sm:text-sm">
                          {feature.title}
                        </span>
                      </div>
                      <div>
                        <img
                          src={feature.image}
                          height="200"
                          width="500"
                          alt=""
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                  <h3 className="text-4xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-base text-xl sm:text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

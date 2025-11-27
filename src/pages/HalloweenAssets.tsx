import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Download,
  FileText,
  KeyRound,
  List,
  Timer,
  Wallet,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  // Bats
  batGlide,
  batHang,
  batSwoop,
  // Backgrounds
  bgBluePumpkins,
  bgPumpkinOutsideWindow,
  bgSacredCatMoon,
  bgWitchGraveyard,
  candleFive,
  // Candles
  candleTrio,
  cardBlueCemetary,
  // Card Backgrounds
  cardCatFence,
  cardCuteGhotsGraves,
  cardFieryPumpkin,
  cardHauntedHouse,
  cardLargeTree,
  cardPumpkinsFullMoon,
  cardPumpkinsMany,
  cardPumpkinsStaring,
  cardPumpkinThree,
  cardPurpleWitchhouse,
  cardRedmoonBackyard,
  cardStaryCatEyes,
  cardThemedHouses,
  // Houses
  castleHilltop,
  // Cats
  catArched,
  catCrouch,
  catFluffy,
  catWitchHat,
  churchGothic,
  // Calendar Backgrounds
  clCartoonManor,
  clMoonlitPatch,
  clSpookyHouse,
  clWitchSilhouette,
  // Fences
  fenceLeaning,
  fenceStraight,
  fenceTall,
  fenceWarped,
  gateArched,
  // Ghosts
  ghostDroopy,
  ghostGenie,
  ghostJagged,
  ghostScare,
  mansionCrooked,
  pumpkinBlocky,
  // Pumpkins
  pumpkinScary,
  pumpkinSneaky,
  pumpkinWitchhat,
  schoolhouseSteeple,
  // Skulls
  skullLowerEyes,
  skullPointyEyes,
  skullRightView,
  skullStaring,
  skullTiltedLeftView,
  // Spiders
  spiderCuteHanging,
  spiderHairyCrawling,
  spiderSharpHanging,
  // Trees
  treeMonstergrin,
  treeMonsterscream,
  treeSceneryCurly,
  treeSceneryJagged,
  webCenter,
  webCenterHanging,
  // Webs
  webCornerLeft,
  webHanging,
  webLeftHanging,
  webNormal,
  // Witches
  witchBrew,
  witchFly,
  witchTakeoff,
} from "@/assets";
import { Footer, LandingNav } from "@/components/landing";
import { useTheme } from "@/contexts/ThemeContext";

interface Asset {
  name: string;
  src: string;
  category: string;
  type: "svg" | "webp";
}

export const HalloweenAssets: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navFeatures = [
    { name: "Accounts", icon: KeyRound, color: "#6366F1" },
    { name: "Budget", icon: Wallet, color: "#F59E0B" },
    { name: "Journal", icon: BookOpen, color: "#8B5CF6" },
    { name: "Notes", icon: FileText, color: "#EC4899" },
    { name: "Pomodoro", icon: Clock, color: "#EF4444" },
    { name: "Tasks", icon: List, color: "#10B981" },
    { name: "Time", icon: Timer, color: "#3B82F6" },
  ];

  const assets: Asset[] = [
    // Pumpkins
    {
      name: "Pumpkin Scary",
      src: pumpkinScary,
      category: "Pumpkins",
      type: "svg",
    },
    {
      name: "Pumpkin Sneaky",
      src: pumpkinSneaky,
      category: "Pumpkins",
      type: "svg",
    },
    {
      name: "Pumpkin Blocky",
      src: pumpkinBlocky,
      category: "Pumpkins",
      type: "svg",
    },
    {
      name: "Pumpkin Witch Hat",
      src: pumpkinWitchhat,
      category: "Pumpkins",
      type: "svg",
    },
    // Ghosts
    { name: "Ghost Droopy", src: ghostDroopy, category: "Ghosts", type: "svg" },
    { name: "Ghost Genie", src: ghostGenie, category: "Ghosts", type: "svg" },
    { name: "Ghost Jagged", src: ghostJagged, category: "Ghosts", type: "svg" },
    { name: "Ghost Scare", src: ghostScare, category: "Ghosts", type: "svg" },
    // Skulls
    {
      name: "Skull Lower Eyes",
      src: skullLowerEyes,
      category: "Skulls",
      type: "svg",
    },
    {
      name: "Skull Pointy Eyes",
      src: skullPointyEyes,
      category: "Skulls",
      type: "svg",
    },
    {
      name: "Skull Right View",
      src: skullRightView,
      category: "Skulls",
      type: "svg",
    },
    {
      name: "Skull Staring",
      src: skullStaring,
      category: "Skulls",
      type: "svg",
    },
    {
      name: "Skull Tilted Left",
      src: skullTiltedLeftView,
      category: "Skulls",
      type: "svg",
    },
    // Spiders
    {
      name: "Spider Cute",
      src: spiderCuteHanging,
      category: "Spiders",
      type: "svg",
    },
    {
      name: "Spider Hairy",
      src: spiderHairyCrawling,
      category: "Spiders",
      type: "svg",
    },
    {
      name: "Spider Sharp",
      src: spiderSharpHanging,
      category: "Spiders",
      type: "svg",
    },
    // Bats
    { name: "Bat Glide", src: batGlide, category: "Bats", type: "svg" },
    { name: "Bat Hang", src: batHang, category: "Bats", type: "svg" },
    { name: "Bat Swoop", src: batSwoop, category: "Bats", type: "svg" },
    // Cats
    { name: "Cat Arched", src: catArched, category: "Cats", type: "svg" },
    { name: "Cat Crouch", src: catCrouch, category: "Cats", type: "svg" },
    { name: "Cat Fluffy", src: catFluffy, category: "Cats", type: "svg" },
    { name: "Cat Witch Hat", src: catWitchHat, category: "Cats", type: "svg" },
    // Webs
    { name: "Web Corner", src: webCornerLeft, category: "Webs", type: "svg" },
    { name: "Web Center", src: webCenter, category: "Webs", type: "svg" },
    { name: "Web Hanging", src: webHanging, category: "Webs", type: "svg" },
    { name: "Web Normal", src: webNormal, category: "Webs", type: "svg" },
    {
      name: "Web Left Hanging",
      src: webLeftHanging,
      category: "Webs",
      type: "svg",
    },
    {
      name: "Web Center Hanging",
      src: webCenterHanging,
      category: "Webs",
      type: "svg",
    },
    // Candles
    { name: "Candle Trio", src: candleTrio, category: "Candles", type: "svg" },
    { name: "Candle Five", src: candleFive, category: "Candles", type: "svg" },
    // Witches
    { name: "Witch Brew", src: witchBrew, category: "Witches", type: "svg" },
    { name: "Witch Fly", src: witchFly, category: "Witches", type: "svg" },
    {
      name: "Witch Takeoff",
      src: witchTakeoff,
      category: "Witches",
      type: "svg",
    },
    // Trees
    {
      name: "Tree Monster Grin",
      src: treeMonstergrin,
      category: "Trees",
      type: "svg",
    },
    {
      name: "Tree Monster Scream",
      src: treeMonsterscream,
      category: "Trees",
      type: "svg",
    },
    {
      name: "Tree Scenery Curly",
      src: treeSceneryCurly,
      category: "Trees",
      type: "svg",
    },
    {
      name: "Tree Scenery Jagged",
      src: treeSceneryJagged,
      category: "Trees",
      type: "svg",
    },
    // Fences
    {
      name: "Fence Leaning",
      src: fenceLeaning,
      category: "Fences",
      type: "svg",
    },
    {
      name: "Fence Straight",
      src: fenceStraight,
      category: "Fences",
      type: "svg",
    },
    { name: "Fence Tall", src: fenceTall, category: "Fences", type: "svg" },
    { name: "Fence Warped", src: fenceWarped, category: "Fences", type: "svg" },
    { name: "Gate Arched", src: gateArched, category: "Fences", type: "svg" },
    // Houses
    {
      name: "Castle Hilltop",
      src: castleHilltop,
      category: "Houses",
      type: "svg",
    },
    {
      name: "Church Gothic",
      src: churchGothic,
      category: "Houses",
      type: "svg",
    },
    {
      name: "Mansion Crooked",
      src: mansionCrooked,
      category: "Houses",
      type: "svg",
    },
    {
      name: "Schoolhouse Steeple",
      src: schoolhouseSteeple,
      category: "Houses",
      type: "svg",
    },
    // Backgrounds
    {
      name: "Blue Pumpkins",
      src: bgBluePumpkins,
      category: "Backgrounds",
      type: "webp",
    },
    {
      name: "Sacred Cat Moon",
      src: bgSacredCatMoon,
      category: "Backgrounds",
      type: "webp",
    },
    {
      name: "Witch Graveyard",
      src: bgWitchGraveyard,
      category: "Backgrounds",
      type: "webp",
    },
    {
      name: "Pumpkin Outside Window",
      src: bgPumpkinOutsideWindow,
      category: "Backgrounds",
      type: "webp",
    },
    // Card Backgrounds
    {
      name: "Card Cat Fence",
      src: cardCatFence,
      category: "Card Backgrounds",
      type: "webp",
    },
    {
      name: "Card Fiery Pumpkin",
      src: cardFieryPumpkin,
      category: "Card Backgrounds",
      type: "webp",
    },
    {
      name: "Card Haunted House",
      src: cardHauntedHouse,
      category: "Card Backgrounds",
      type: "webp",
    },
    {
      name: "Card Pumpkin Three",
      src: cardPumpkinThree,
      category: "Card Backgrounds",
      type: "webp",
    },
    {
      name: "Card Pumpkins Full Moon",
      src: cardPumpkinsFullMoon,
      category: "Card Backgrounds",
      type: "webp",
    },
    {
      name: "Card Pumpkins Many",
      src: cardPumpkinsMany,
      category: "Card Backgrounds",
      type: "webp",
    },
    {
      name: "Card Pumpkins Staring",
      src: cardPumpkinsStaring,
      category: "Card Backgrounds",
      type: "webp",
    },
    {
      name: "Card Purple Witchhouse",
      src: cardPurpleWitchhouse,
      category: "Card Backgrounds",
      type: "webp",
    },
    {
      name: "Card Blue Cemetary",
      src: cardBlueCemetary,
      category: "Card Backgrounds",
      type: "webp",
    },
    {
      name: "Card Cute Ghosts Graves",
      src: cardCuteGhotsGraves,
      category: "Card Backgrounds",
      type: "webp",
    },
    {
      name: "Card Large Tree",
      src: cardLargeTree,
      category: "Card Backgrounds",
      type: "webp",
    },
    {
      name: "Card Redmoon Backyard",
      src: cardRedmoonBackyard,
      category: "Card Backgrounds",
      type: "webp",
    },
    {
      name: "Card Stary Cat Eyes",
      src: cardStaryCatEyes,
      category: "Card Backgrounds",
      type: "webp",
    },
    {
      name: "Card Themed Houses",
      src: cardThemedHouses,
      category: "Card Backgrounds",
      type: "webp",
    },
    // Calendar Backgrounds
    {
      name: "Cartoon Manor",
      src: clCartoonManor,
      category: "Calendar Backgrounds",
      type: "webp",
    },
    {
      name: "Moonlit Patch",
      src: clMoonlitPatch,
      category: "Calendar Backgrounds",
      type: "webp",
    },
    {
      name: "Spooky House",
      src: clSpookyHouse,
      category: "Calendar Backgrounds",
      type: "webp",
    },
    {
      name: "Witch Silhouette",
      src: clWitchSilhouette,
      category: "Calendar Backgrounds",
      type: "webp",
    },
  ];

  const categories = [
    "All",
    ...Array.from(new Set(assets.map((a) => a.category))).sort(),
  ];

  const filteredAssets =
    selectedCategory === "All"
      ? assets
      : assets.filter((a) => a.category === selectedCategory);

  const handleDownload = async (asset: Asset) => {
    try {
      const response = await fetch(asset.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${asset.name.toLowerCase().replace(/\s+/g, "-")}.${asset.type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0A0A0B]" : "bg-gray-50"}`}>
      <LandingNav
        isDark={isDark}
        navFeatures={navFeatures}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className={`flex items-center space-x-2 mb-8 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            isDark
              ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1
            className={`text-4xl md:text-5xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            🎃 Halloween Assets
          </h1>
          <p
            className={`text-lg ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
          >
            Free Halloween decorations and backgrounds for your projects
          </p>
          <p
            className={`text-sm mt-2 ${isDark ? "text-[#B4B4B8]" : "text-gray-500"}`}
          >
            {assets.length} assets available • Click to download
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-[#60c9b6] text-white shadow-lg"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] text-[#B4B4B8] hover:bg-[rgba(255,255,255,0.1)]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets.map((asset, index) => (
            <motion.div
              key={asset.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => handleDownload(asset)}
              className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                isDark
                  ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] hover:border-[#60c9b6] hover:shadow-[0_0_20px_rgba(96,201,182,0.2)]"
                  : "bg-white border-gray-200 hover:border-[#60c9b6] hover:shadow-lg"
              }`}
            >
              <div className="aspect-square flex items-center justify-center mb-3">
                <img
                  src={asset.src}
                  alt={asset.name}
                  className={`max-w-full max-h-full object-contain ${
                    asset.type === "webp" ? "rounded-lg" : ""
                  }`}
                />
              </div>
              <div className="text-center">
                <p
                  className={`text-xs font-medium mb-1 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {asset.name}
                </p>
                <p
                  className={`text-[10px] uppercase ${
                    isDark ? "text-[#B4B4B8]" : "text-gray-500"
                  }`}
                >
                  {asset.type}
                </p>
              </div>
              <button
                onClick={() => handleDownload(asset)}
                className={`absolute top-2 right-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                  isDark
                    ? "bg-[#60c9b6] text-white hover:bg-[#48b39e]"
                    : "bg-[#60c9b6] text-white hover:bg-[#48b39e]"
                }`}
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer isDark={isDark} />
    </div>
  );
};

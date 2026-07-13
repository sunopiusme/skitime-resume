import XsycoinHero from "@/features/projects/xsycoin/XsycoinHero";
import Tokenomics from "@/features/projects/xsycoin/Tokenomics";
import CharacterGrid from "@/features/projects/xsycoin/CharacterGrid";
import MenuItems from "@/features/projects/xsycoin/MenuItems";
import MenuItemDetails from "@/features/projects/xsycoin/MenuItemDetails";
import TabBar from "@/features/projects/xsycoin/TabBar";
import MiniProfile from "@/features/projects/xsycoin/MiniProfile";

/* XSYCOIN — hero-сцена «затмения», сразу за ней токеномика $XSY (монета
   и экономика игры). Дальше — bento-грид персонажей (четыре формы жизни),
   и обзор навигации целиком: «Пункты меню» (папки) и превью таб-бара с теми
   же пунктами, а уже за ними поэлементный разбор каждого. Сначала карта,
   потом территория. Кейс растёт секциями. */
export default function XsycoinCase() {
  return (
    <>
      <XsycoinHero />
      <Tokenomics />
      <CharacterGrid />
      <MenuItems />
      <TabBar />
      <MenuItemDetails />
      <MiniProfile />
    </>
  );
}

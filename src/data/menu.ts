import { IMenuItem } from "../helpers/types";

import espresso from "../assets/menu/espresso.jpg";
import doubleEspresso from "../assets/menu/double-espresso.jpg";
import americano from "../assets/menu/americano.jpg";
import latte from "../assets/menu/latte.jpg";
import cappuccino from "../assets/menu/cappuccino.jpg";
import tea from "../assets/menu/tea.jpg";
import blueberryMuffin from "../assets/menu/blueberry-muffin.jpg";
import chocolateMuffin from "../assets/menu/chocolate-muffin.jpg";
import scone from "../assets/menu/scone.jpg";
import croissant from "../assets/menu/croissant.jpg";
import almondCroissant from "../assets/menu/almond-croissant.jpg";

const menu: IMenuItem[] = [
  {
    name: "Espresso",
    description: "Small cup with 1 shot",
    price: 2.5,
    image: espresso
  },
  {
    name: "Double Espresso",
    description: "Small cup with 2 shots",
    price: 3.0,
    image: doubleEspresso
  },
  {
    name: "Americano",
    description: "Large cup with 1 shot and hot water",
    price: 3.0,
    image: americano
  },
  {
    name: "Latte",
    description: "Large cup with 1 shot and milk",
    price: 3.5,
    image: latte
  },
  {
    name: "Cappuccino",
    description: "Large cup with 1 shot and foam",
    price: 3.5,
    image: cappuccino
  },
  {
    name: "Tea",
    description: "Large cup with loose leaf tea",
    price: 2.5,
    image: tea
  },
  {
    name: "Blueberry Muffin",
    description: "Muffin with blueberries",
    price: 2.5,
    image: blueberryMuffin
  },
  {
    name: "Chocolate Muffin",
    description: "Muffin with chocolate chips",
    price: 2.5,
    image: chocolateMuffin
  },
  {
    name: "Scone",
    description: "Plain scope with jam",
    price: 2.5,
    image: scone
  },
  {
    name: "Croissant",
    description: "Plain croissant",
    price: 2.5,
    image: croissant
  },
  {
    name: "Almond Croissant",
    description: "Croissant with almond filling",
    price: 2.5,
    image: almondCroissant
  }
];

export default menu;

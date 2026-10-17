/*
 * Ludlam Point — site content
 * ---------------------------------------------------------------
 * Every fact here was taken from www.ludlampoint.com on Oct 16, 2026.
 * Edit this file to update copy, links, plans or photos; the page
 * renders from it. Nothing here is invented: if the official site
 * does not state it, it is not on this site.
 */
(function () {
  const MEDIA = "https://medialibrarycfo.entrata.com/";

  /* Photo paths on the property's Entrata media library */
  const P = {
    // Apartment interiors
    kitchenBar: "16362/MLv3/3/27/2025/09/10/101025/60568_100120030_67f6e6115185a2.77941510198.jpg",
    kitchenWhite: "16362/MLv3/3/27/2025/09/10/101025/60569_100120030_67f6e612207c94.16288664825.jpg",
    openKitchen: "16362/MLv3/3/27/2025/09/10/101025/60570_100120030_67f6e613084c70.01796922174.jpg",
    dining: "16362/MLv3/3/27/2025/09/10/101025/60571_100120030_67f6e61437ea98.10185265660.jpg",
    openPlan: "16362/MLv3/3/27/2025/09/10/101025/60572_100120030_67f6e6151c9756.21395017284.jpg",
    living: "16362/MLv3/3/27/2025/09/10/101025/60573_100120030_67f6e615e672b0.39446746386.jpg",
    bed1: "16362/MLv3/3/27/2025/09/10/101025/60565_100120030_67f6e60ed2fe75.85152164204.jpg",
    bed2: "16362/MLv3/3/27/2025/09/10/101025/60566_100120030_67f6e60f9a6ab6.90572814865.jpg",
    bed3: "16362/MLv3/3/27/2025/09/10/101025/60567_100120030_67f6e61080b8d2.14028152746.jpg",
    kitchen2: "16362/MLv3/3/27/2025/09/11/031751/68c33c7e865db7.37121797995.jpg",
    model1: "16362/MLv3/3/27/2025/09/11/031753/68c33c7fc9f504.46355246799.jpg",
    model2: "16362/MLv3/3/27/2025/09/11/031754/68c33c8143ef01.81541023656.jpg",
    model3: "16362/MLv3/3/27/2025/09/11/031755/68c33c8284f144.74233583886.jpg",
    model4: "16362/MLv3/3/27/2025/09/11/031756/68c33c84164453.41518950431.jpg",
    model5: "16362/MLv3/3/27/2025/09/11/031758/68c33c854c23b4.68249572328.jpg",
    model6: "16362/MLv3/3/27/2025/09/11/031759/68c33c86770c92.12704517211.jpg",
    openConcept: "16362/MLv3/5/29/2025/09/10/101025/80222_100120030_685ed272c77dd9.34843471290.jpg",
    // Community
    entrance: "16362/MLv3/3/27/2025/09/10/101025/62737_100120030_6802bb2d020ef5.18776395745.jpg",
    lounge: "16362/MLv3/3/27/2025/09/10/101025/62738_100120030_6802bb2dae3b36.52053227791.jpg",
    office: "16362/MLv3/3/27/2025/09/10/101025/62739_100120030_6802bb2e4a40a1.72564085968.jpg",
    coffee: "16362/MLv3/3/27/2025/09/10/101025/62740_100120030_6802bb2ee12662.83222591811.jpg",
    gym: "16362/MLv3/3/27/2025/09/10/101025/62741_100120030_6802bb2f740407.80041695946.jpg",
    bbq: "16362/MLv3/3/27/2025/09/10/101025/62742_100120030_6802bb3038f771.64559299885.jpg",
    poolBar: "16362/MLv3/3/27/2025/09/10/101025/62745_100120030_6802bb3225fa47.85478345174.jpg",
    poolPalms: "16362/MLv3/3/27/2025/09/10/101025/62746_100120030_6802bb329f53f3.80988154285.jpg",
    path: "16362/MLv3/3/27/2025/09/10/101025/62747_100120030_6802bb333631b9.14058109572.jpg",
    seating: "16362/MLv3/3/27/2025/09/10/101025/62750_100120030_6802bb356937e4.03596184816.jpg",
    dogWash: "16362/MLv3/3/27/2025/09/10/101025/62751_100120030_6802bb360c1151.22628385285.jpg",
    court1: "16362/MLv3/3/27/2025/09/10/101025/62743_100120030_6802bb30ea8786.39540965417.jpg",
    court2: "16362/MLv3/3/27/2025/09/10/101025/62752_100120030_6802bb36b59e18.69633043819.jpg",
    carWash: "16362/MLv3/3/27/2025/09/10/101025/62755_100120030_6802bb39478050.41268480622.jpg",
    ext1: "16362/MLv3/3/27/2025/09/11/031800/68c33c87abba90.21560161802.jpg",
    ext2: "16362/MLv3/3/27/2025/09/11/031802/68c33c89326ab2.77407381705.jpg",
    ext3: "16362/MLv3/3/27/2025/09/11/031803/68c33c8a928936.79984711692.jpg",
    ext4: "16362/MLv3/3/27/2025/09/11/031805/68c33c8c66a340.74921053557.jpg",
    // Amenity-page photography
    amenBbq: "16362/MLv3/5/29/2025/09/10/101025/80224_100120030_685ed2f2bcd245.44961375948.jpg",
    amenPool: "16362/MLv3/5/29/2025/09/10/101025/80218_100120030_685ed1d27cbd96.95089066741.jpg",
    amenCarWash: "16362/MLv3/5/29/2025/09/10/101025/80219_100120030_685ed1f7ae3340.31253089732.jpg",
    amenCourt: "16362/MLv3/5/29/2025/09/10/101025/80220_100120030_685ed21c083da6.95622155870.jpg",
    amenGym: "16362/MLv3/5/29/2025/09/10/101025/80223_100120030_685ed29139c231.04670353894.jpg",
    amenDog: "16362/MLv3/5/29/2025/09/10/101025/80221_100120030_685ed23c347102.75688162246.jpg",
    // Floor plan renderings
    fpCarlyle: "16362/MLv3/4/23/2025/09/10/101025/59326_100120030_67ef64e5275c90.39460595138.png",
    fpDelano: "16362/MLv3/4/23/2025/09/10/101025/59325_100120030_67ef64889c85c9.80079616760.png",
    fpAvalon: "16362/MLv3/4/23/2025/09/10/101025/59327_100120030_67ef65918e09b4.92774921198.png",
    fpBeacon: "16362/MLv3/4/23/2025/09/10/101025/59329_100120030_67ef66008d5fa2.30031431106.png",
  };

  const SITE = "https://www.ludlampoint.com";

  window.LP = {
    media: MEDIA,
    /* true: load the site's own copies from assets/img (built by scripts/build-images.py),
       falling back to the media library for any photo that is missing */
    useLocalPhotos: true,
    photos: P,
    checkedOn: "2026-10-16",

    property: {
      name: "Ludlam Point",
      street: "6880 SW 44th Street",
      city: "Miami",
      state: "FL",
      zip: "33155",
      neighborhood: "Glenvar Heights",
      lat: 25.7291836,
      lng: -80.3063361,
      phone: "(239) 999-8374",
      phoneHref: "tel:+12399998374",
      manager: "Greystar",
      hours: [
        { days: "Monday – Friday", time: "10:00 AM – 6:00 PM" },
        { days: "Saturday", time: "9:00 AM – 6:00 PM" },
        { days: "Sunday", time: "Closed" },
      ],
    },

    links: {
      floorPlans: SITE + "/miami/ludlam-point/conventional/",
      apply: SITE + "/Apartments/module/application_authentication/popup/false/kill_session/1/property%5Bid%5D/100120030/",
      contact: SITE + "/miami/ludlam-point/guest-card/contact-us/1/",
      photos: SITE + "/miami/ludlam-point/photos/",
      amenities: SITE + "/miami/ludlam-point/amenities/",
      residents: "https://app.homebody.com",
      directions: "https://www.google.com/maps/dir/?api=1&destination=6880+SW+44th+St,+Miami,+FL+33155",
      mapOpen: "https://www.google.com/maps/search/?api=1&query=6880+SW+44th+St,+Miami,+FL+33155",
      mapEmbed: "https://www.google.com/maps?q=6880+SW+44th+St,+Miami,+FL+33155&z=14&output=embed",
    },

    legal: [
      { label: "Fair Housing Statement", href: "https://www.greystar.com/fair-housing-statement" },
      { label: "Accessibility Statement", href: SITE + "/accessibility-statement" },
      { label: "Disclosures & Licenses", href: "https://www.greystar.com/disclosures-and-licenses" },
      { label: "Renters' Rights & Resources", href: "https://www.greystar.com/renters-rights-resources" },
      { label: "Privacy Policy", href: "https://www.greystar.com/privacy" },
      { label: "DMCA Agent", href: "https://www.greystar.com/terms-of-use#Copyright%20Infringement%20Policy" },
      { label: "Terms of Use", href: SITE + "/terms-of-use/" },
    ],

    /*
     * Floor plans. Prices and availability change daily in the official
     * leasing system, so the site shows them only as a dated snapshot
     * and always sends people to the live plan page for current homes.
     * Set `showPriceSnapshot: false` to hide prices entirely.
     */
    showPriceSnapshot: true,
    deposit: "$500 refundable security deposit",
    plans: [
      {
        id: "carlyle",
        name: "Carlyle",
        beds: 1, baths: 1, sqft: 750,
        levels: 1,
        image: P.fpCarlyle,
        imageAlt: "Carlyle floor plan rendering: one bedroom, one bath, 750 square feet",
        fromPrice: 2174, term: "16-month lease",
        url: SITE + "/floorplans/miami-FL/ludlam-point/carlyle-849127-1/",
      },
      {
        id: "delano",
        name: "Delano",
        beds: 1, baths: 1, sqft: 750,
        levels: 2,
        note: "Two-level layout: open kitchen and living room downstairs, bedroom and home office space upstairs.",
        image: P.fpDelano,
        imageAlt: "Delano two-level floor plan rendering: kitchen and living downstairs, bedroom and office upstairs",
        fromPrice: 2113, term: "14-month lease",
        url: SITE + "/floorplans/miami-FL/ludlam-point/delano-849128-1/",
      },
      {
        id: "avalon",
        name: "Avalon",
        beds: 2, baths: 2, sqft: 950,
        levels: 2,
        note: "Two-level layout with a bedroom on each level.",
        image: P.fpAvalon,
        imageAlt: "Avalon two-level floor plan rendering: two bedrooms, two baths, 950 square feet",
        fromPrice: 2499, term: "15-month lease",
        url: SITE + "/floorplans/miami-FL/ludlam-point/avalon-849125-1/",
      },
      {
        id: "beacon",
        name: "Beacon",
        beds: 2, baths: 2, sqft: 950,
        levels: 2,
        note: "Two-level layout: kitchen and living room on one level, both bedrooms on the other.",
        image: P.fpBeacon,
        imageAlt: "Beacon two-level floor plan rendering: kitchen and living on one level, two bedrooms on the other",
        fromPrice: 2296, term: "16-month lease",
        url: SITE + "/floorplans/miami-FL/ludlam-point/beacon-849126-1/",
      },
    ],

    /* Shown only while the dates are valid; hides itself after `ends`. */
    special: {
      text: "Limited time: admin fee waived, a $250 savings. Valid Oct 12 – 31, 2026. Ask the leasing team for details.",
      starts: "2026-10-12",
      ends: "2026-10-31",
    },

    pricingDisclosure:
      "Prices shown are the Total Monthly Leasing Price, which is Base Rent plus fixed, mandatory monthly fees. " +
      "Essentials and any Personalized Add-Ons are additional. Pricing and availability change frequently; " +
      "confirm current figures on the live plan page. Floor plans are artist's renderings, dimensions are approximate, " +
      "actual specifications may vary, and not all features are available in every rental home.",

    homeFeatures: [
      "In-home washer and dryer",
      "Granite counters",
      "Subway tile kitchen backsplash",
      "Stainless-steel, energy-efficient appliances",
      "White custom cabinetry with brushed nickel hardware",
      "Single-handle pullout kitchen faucet",
      "Dishwasher and over-the-oven microwave",
      "Hardwood-style flooring",
      "Spacious walk-in closets",
      "8' ceilings, vaulted on top floors",
      "Crown molding and two-toned paint",
      "Raised-panel doors with lever handles",
      "Ceiling fan in the dining room",
      "Air conditioning",
      "Monitored alarm systems",
      "Wired for high-speed internet",
    ],

    /* Amenity story scenes — every item is listed on the official amenities page */
    scenes: [
      {
        id: "mornings",
        title: "Slow mornings.",
        body: "Light through the bedroom window, coffee at the granite counter, and laundry running in your own washer and dryer.",
        items: ["In-home washer and dryer", "Spacious walk-in closets", "Granite counters", "Ceiling fan in the dining room"],
        photo: P.bed1,
        alt: "Bright bedroom with a tufted headboard and a window",
      },
      {
        id: "recharge",
        title: "Room to recharge.",
        body: "A fitness center for the early workout, then the pool for the long afternoon. Both are a short walk from your door.",
        items: ["Fitness center", "Community swimming pool"],
        photo: P.amenGym,
        alt: "Fitness center with cardio equipment, a yellow accent wall and large mirrors",
      },
      {
        id: "outside",
        title: "Time outside.",
        body: "Courtyards with BBQ grills for weekend cookouts, a basketball court for a pickup game, and a bark park with a paw spa for the dog.",
        items: ["Courtyards with BBQ grills", "Basketball court", "Bark park with paw spa", "Wi-Fi in common areas"],
        photo: P.amenBbq,
        alt: "Outdoor grilling area with stainless-steel barbecues and tropical landscaping",
      },
      {
        id: "routine",
        title: "Space for your routine.",
        body: "The everyday details are handled: a gated electronic entrance, a car care center, bike storage and maintenance around the clock.",
        items: ["Gated electronic entrance", "Car care center with wash and vacuum", "Bicycle storage", "24-hour emergency maintenance", "Online rent payments", "Flex | Split rent option"],
        photo: P.amenCarWash,
        alt: "Outdoor car wash station surrounded by greenery and palm trees",
      },
    ],

    gallery: {
      apartments: [
        [P.openConcept, "Open-concept living area, kitchen with breakfast bar and dining space"],
        [P.kitchenBar, "Kitchen with stainless appliances and bar seating"],
        [P.kitchenWhite, "Kitchen with white cabinets and stainless appliances"],
        [P.openKitchen, "Open-concept kitchen and living space"],
        [P.living, "Living room with sofa and colorful accents"],
        [P.openPlan, "Open-plan lounge, dining and kitchen"],
        [P.dining, "Dining area"],
        [P.bed1, "Bedroom with tufted headboard and window"],
        [P.bed2, "Bedroom with red and white accents"],
        [P.bed3, "Bedroom with yellow accents and a large window"],
        [P.model1, "Bedroom with wood-style flooring"],
        [P.model2, "Kitchen opening to the living area"],
        [P.model3, "Two-level home with stairs to the upper floor"],
        [P.model4, "Bedroom with a walk-in closet"],
        [P.model5, "Living area with wood-style flooring"],
        [P.model6, "Open living area with kitchen and ceiling fan"],
      ],
      community: [
        [P.amenPool, "Pool with lounge seating, palm trees and apartment buildings"],
        [P.poolPalms, "Pool with palm trees and poolside seating"],
        [P.poolBar, "Pool with covered bar and high stools"],
        [P.ext2, "Covered grill station with bar seating"],
        [P.ext1, "Community entrance and Ludlam Point sign"],
        [P.path, "Tropical landscaping along a walking path"],
        [P.entrance, "Building entrance with blue walls and greenery"],
        [P.lounge, "Clubhouse lounge with green sofa"],
        [P.office, "Leasing office with natural light"],
        [P.coffee, "Clubhouse kitchen with coffee nook"],
        [P.gym, "Fitness center"],
        [P.bbq, "Outdoor BBQ area"],
        [P.seating, "Outdoor seating area"],
        [P.court2, "Basketball court"],
        [P.court1, "Basketball court with greenery"],
        [P.dogWash, "Dog wash station"],
        [P.carWash, "Car wash station with palm trees"],
        [P.ext3, "Parking and buildings"],
      ],
    },

    /* Named on the official homepage; no distances are published, so none are shown */
    nearby: [
      { group: "Neighborhoods", items: ["Coral Gables", "Coconut Grove", "Downtown Miami"] },
      { group: "Shopping & dining", items: ["Dadeland Mall", "The Shops at Sunset Place", "Fountain Square"] },
      { group: "Major employers", items: ["University of Miami", "Baptist Health"] },
    ],
  };
})();

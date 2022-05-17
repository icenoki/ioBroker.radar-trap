// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const crossFetch = require("cross-fetch"); // funktioniert wahrscheinlich nur mit axios
const along = require("@turf/along").default;
const length = require("@turf/length").default;
const destination = require("@turf/destination").default;
const pointToLineDistance = require("@turf/point-to-line-distance").default;
const {point, feature} = require("@turf/helpers");
const polyline = require("@mapbox/polyline");

const type_text = {
  "0": "unbekannt, mobil",
  "1": "Geschwindigkeit, mobil",
  "2": "Rotlicht, mobil",
  "3": "Gewicht, mobil",
  "4": "allg. Verkehrskontrolle, mobil",
  "5": "Alkohol, mobil",
  "6": "Abstand, mobil",
  "7": "Geschwindigkeit, mobil",
  "11": "Rotlicht, mobil",
  "12": "Section Control, mobil",
  "20": "Stauende, mobil",
  "21": "Unfall, mobil",
  "22": "Tagesbaustelle, mobil",
  "23": "Hindernis, mobil",
  "24": "Rutschgefahr, mobil",
  "25": "Sichtbehinderung, mobil",
  "26": "Dauerbaustelle, mobil",
  "101": "Abstandskontrolle, fest",
  "102": "Attrappe, fest",
  "103": "Auffahrtskontrolle, fest",
  "104": "Busspurkontrolle, fest",
  "105": "Einfahrtskontrolle, fest",
  "106": "Fußgängerüberweg, fest",
  "107": "Geschwindigkeit, fest",
  "110": "Kombiniert, fest",
  "111": "Rotlicht, fest",
  "108": "Gewichtskontrolle, fest",
  "109": "Höhenkontrolle, fest",
  "112": "Section Control, fest",
  "113": "Section Control Ende, fest",
  "114": "Tunnel, fest",
  "115": "Überholverbot, fest",
};

// eslint-disable-next-line no-unused-vars
async function getTraps(directionLine) {
  let countCluster = 0;
  const trapBase = "0,1,2,3,4,5,6,20,21,22,23,24,25,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115";

  // let fetchCount = 0;

  async function traps(minPos, maxPos) {

    const {pois} = await crossFetch(
      `https://cdn2.atudo.net/api/1.0/vl.php?type=${trapBase}&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
    ).then(res => res.json());

    // console.log("FETCH:", ++fetchCount);

    return await pois.reduce(async (plist, poi) => {
      const list = await plist;

      if (poi["info"].search(/count_cluster/) !== -1) {
        countCluster++;

        if (countCluster < 4) {
          const minBox = destination(point([poi.lng, poi.lat]), 2, -135, {units: "kilometers"});
          const maxBox = destination(point([poi.lng, poi.lat]), 2, 45, {units: "kilometers"});

          const clusterTraps = await traps({lng: minBox.geometry.coordinates[0], lat: minBox.geometry.coordinates[1]},
            {lng: maxBox.geometry.coordinates[0], lat: maxBox.geometry.coordinates[1]});
          // console.log("count cluster found && coutCluster < 2:", clusterTraps.length);

          countCluster--;
          return [...list, ...clusterTraps];
        } else {
          return list;
        }
      }

      const trapPoint = point([poi.lng, poi.lat]);
      trapPoint.properties = poi;
      list.push(trapPoint);

      return list;
    }, Promise.resolve([]));
  }

  let resultTraps = [];
  const directionSteps = Math.trunc(length(directionLine) / 6);
  for (let i = 0; i < directionSteps; i++) {
    const directionPoint = along(directionLine, i * 6);
    const minBox = destination(directionPoint, 3, -135, {units: "kilometers"});
    const maxBox = destination(directionPoint, 3, 45, {units: "kilometers"});

    const clusterTraps = await traps({lng: minBox.geometry.coordinates[0], lat: minBox.geometry.coordinates[1]},
      {lng: maxBox.geometry.coordinates[0], lat: maxBox.geometry.coordinates[1]});

    resultTraps = [...resultTraps, ...clusterTraps];
  }

  // console.log("RESULTTRAPS", resultTraps);

  return resultTraps.reduce((list, trapPoint) => {
    const existingPoi = list.find(searchPoi => searchPoi.properties.content === trapPoint.properties.content);

    if (!existingPoi) {
      const trapDistance = pointToLineDistance(trapPoint, feature(directionLine), {units: "meters"});
      if (trapDistance < 20) {
        // console.log("Treffer->Distanz:", trapDistance);
        trapPoint.properties.distance = trapDistance;
        list.push(trapPoint);
      }
    }

    return list;
  }, []).reduce((list, resultTrap) => {
    resultTrap.properties["type_text"] = type_text[resultTrap.properties.type];

    if (resultTrap.properties.info !== "false") {
      resultTrap.properties["info"] = JSON.parse(resultTrap.properties.info);
    }

    if (resultTrap.properties.polyline !== "") {
      // console.log(resultTrap.properties.polyline);
      resultTrap.properties["polyline"] = feature(polyline.toGeoJSON(resultTrap.properties.polyline));
      resultTrap.properties.polyline.properties["linetrap"] = true;

      // console.log("POLYLINE", resultTrap.properties["polyline"]);
    }

    if (["101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115"].includes(resultTrap.properties.type)) {
      resultTrap.properties["type_name"] = "fixed-trap";
      list["fixedTraps"].push(resultTrap);
    }
    if (["0", "1", "2", "3", "4", "5", "6"].includes(resultTrap.properties.type)) {
      resultTrap.properties["type_name"] = "mobile-trap";
      list["mobileTraps"].push(resultTrap);
    }
    if (["22", "26"].includes(resultTrap.properties.type)) {
      resultTrap.properties["type_name"] = "road-work";
      list["roadWorks"].push(resultTrap);
    }
    if (["20"].includes(resultTrap.properties.type)) {
      resultTrap.properties["type_name"] = "traffic-jam";
      list["trafficJams"].push(resultTrap);
    }
    if (["24"].includes(resultTrap.properties.type)) {
      resultTrap.properties["type_name"] = "sleekness";
      list["sleekness"].push(resultTrap);
    }
    if (["21"].includes(resultTrap.properties.type)) {
      resultTrap.properties["type_name"] = "accident";
      list["accidents"].push(resultTrap);
    }
    if (["25"].includes(resultTrap.properties.type)) {
      resultTrap.properties["type_name"] = "fog";
      list["fog"].push(resultTrap);
    }
    if (["23"].includes(resultTrap.properties.type)) {
      resultTrap.properties["type_name"] = "object";
      list["objects"].push(resultTrap);
    }
    return list;
  }, {"fixedTraps": [], "mobileTraps": [], "roadWorks": [], "trafficJams": [], "sleekness": [], "accidents": [], "fog": [], "objects": []});
}

/* eslint-disable no-unused-vars */
exports.Atudo = class Atudo {
  constructor(options) {
    this.options = options || {};
  }

  async get(directionLine) {
    return await getTraps(directionLine);
  }
};

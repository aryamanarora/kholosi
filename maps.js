var width = window.innerWidth, height = window.innerHeight

var svg = d3.select("#map")
    .attr("preserveAspectRatio", "xMidYMid")
    .attr("viewBox", "0 0 " + width + " " + height)
var g = svg.append("g")

var projection = d3.geoEqualEarth()
    .scale(1000)
    .center([60, 20])
    .translate([width / 2, height / 2])

var path = d3.geoPath()
    .projection(projection)

var scale = 1
function zoomed() {
    g.attr("transform", d3.event.transform)
    scale = d3.event.transform.k
    d3.selectAll(".city")
        .attr("r", 2.5 / d3.event.transform.k)
}
function unzoomed() {
    svg.transition().duration(1000).call(
        zoom.transform,
        d3.zoomIdentity,
        d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    )
}
var zoom = d3.zoom()
    .extent([[0, 0], [width, height]])
    .scaleExtent([1, 12])
    .on("zoom", zoomed)
svg.call(zoom)
svg.on("click", unzoomed)

var header = d3.select(".data")
var dropdown = header.append("select").attr("class", "form-control")
    .on("change", function() {
        dimension(d3.select(this).property('value'))
    })
var info = header.append("p").append("small")
var legend = header.append("p")

var stringToColour = function(str) {
    var hash = 0
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    var colour = '#'
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF
        colour += ('00' + value.toString(16)).substr(-2)
    }
    return colour
}

const locs = {
    "Kholosi": [27.12, 54.30],
    "Sindhi": [26, 69],
    "Khetrani": [30.48, 70.28],
    "Kachchi": [23.83, 69.00],
    "Jadgali": [26.97, 63.53],
    "Lasi": [25.33, 66.91],
    "Saraiki": [29.55, 71.91],
    "Pahari Pothwari": [33.64, 73.81],
    "Luwati": [23.63, 58.49],
    "Parya": [36.49, 69.26],
    "Thari": [25.0960977,70.1806642],
    "Punjabi": [30.04, 75.67],
    "Northern Hindko": [34.32, 73.38],
    "Southern Hindko": [33.21, 72.17],
    "Siraji": [33.14, 75.55],
    "Memoni": [24.85, 67.01],
    "Kashmiri": [34.17, 74.33],
    "Siroli": [27.8514949,68.8456222],
    "Lari": [24.1955515,67.8884947],
    "Awankari": [32.91, 72.17],
    "Kohati": [33.583333, 71.433333],
    "Zargari": [36.0566319, 50.3748733],
    "Domari (Aleppo)": [36.216667, 37.166667],
    "Domari (Jerusalem)": [31.783333, 35.216667],
    "Gujarati": [22.69, 71.10],
    "Hindi": [28.7041, 77.1025],
    "Shina": [34.65, 75.29],
    "Palula": [35.51, 71.84],
    "Kohistani Shina": [35.17, 73.32],
    "Sauji": [35.30, 71.56],
    "Dogri": [32.55, 75.71],
    "Garhwali": [30.51, 78.72],
    "Kumaoni": [29.56, 80.02],
    "Jaunsari": [30.56, 77.91],
    "Pangwali": [32.98, 76.56],
    "Bhadrawahi": [33.29, 75.87],
    "Nepali": [28.00, 85.00],
    "Marwari": [27.00, 75.07],
    "Assamese": [26.09, 91.29],
    "Bengali": [24.00, 90.00],
    "Sylheti": [24.84, 92.25],
    "Marathi": [18.5204, 73.8567],
    "Odia": [21.00, 85.00],
    "Sinhala": [8.00, 81.00],
    "Dameli": [35.30, 71.68],
    "Konkani": [15.27, 74.21],
    "Bhojpuri": [26.46, 84.82],
    "Maithili": [26.38, 86.22],
    "Angika": [26.00, 85.53],
    "Braj": [26.48, 78.08],
    "Haryanvi": [29.02, 76.04],
    "Kannauji": [27.11, 79.29],
    "Bundeli": [24.90, 78.95],
    "Awadhi": [27.59, 82.47],
    "Chakma": [23.00, 92.34],
    "Southeast Pashayi": [34.43, 70.30],
    "Tirahi": [34.18, 69.59],
    "Torwali": [35.31, 72.53],
    "Kalasha": [35.64, 71.67],
    "Indus Kohistani": [35.34, 73.02],
    "Khowar": [36.00, 72.00],
    "Gojri": [33.70, 75.11],
    "Chinali": [32.55, 76.96],
    "Chambeali": [32.55, 76.18],
    "Gaddi": [32.36, 76.57],
    "Bilaspuri": [31.38, 76.67],
    "Mandeali": [31.54, 77.04],
}

const description = {
    "voiced aspirates": "Are voiced aspirated stops (e.g. /bʱ/) present? Do they induce tone?",
    "tr": "What is the outcome of the Old Indo-Aryan <em>tr</em> cluster? (e.g. <em>putrá</em> 'son' > Hindi <em>pūt</em> but Sindhi <em>puṭru</em>)",
    "first person": "What is the etymological source of the first person singular pronoun?",
    "warm": "What is the etymological source of the word for 'warm'?"
}

const data = {
    "voiced aspirates": {
        "Kholosi": ["no"],
        "Sindhi": ["yes"],
        "Punjabi": ["no + tone"],
        "Saraiki": ["yes"],
        "Lasi": ["yes"],
        "Thari": ["yes"],
        "Kachchi": ["yes"],
        "Khetrani": ["yes"],
        "Siroli": ["yes"],
        "Memoni": ["yes"],
        "Northern Hindko": ["no + tone"],
        "Southern Hindko": ["no + tone"],
        "Awankari": ["yes"],
        "Kohati": ["yes + tone", "Shackle, Christopher (1980)"],
        "Kashmiri": ["no"],
        "Pahari Pothwari": ["no + tone", "Khan, Abdul Qadir (2017)"],
        "Siraji": ["no + tone"],
        "Parya": ["no"],
        "Zargari": ["no"],
        "Domari (Aleppo)": ["no"],
        "Domari (Jerusalem)": ["no"],
        "Lari": ["yes"],
        "Gujarati": ["yes"],
        "Hindi": ["yes"],
        "Shina": ["no"],
        "Palula": ["yes", "Liljegren, Henry (2016)"],
        "Kohistani Shina": ["no"],
        "Sauji": ["no"],
        "Dogri": ["no + tone"],
        "Garhwali": ["yes"],
        "Kumaoni": ["yes"],
        "Jaunsari": ["yes"],
        "Pangwali": ["yes"],
        "Bhadrawahi": ["yes"],
        "Nepali": ["yes"],
        "Marwari": ["yes"],
        "Bengali": ["yes"],
        "Assamese": ["yes"],
        "Sylheti": ["no + tone"],
        "Odia": ["yes"],
        "Sinhala": ["no"],
        "Marathi": ["yes"],
        "Dameli": ["no", "Perder, Emil (2013)"],
        "Konkani": ["yes"],
        "Bhojpuri": ["yes"],
        "Maithili": ["yes"],
        "Angika": ["yes"],
        "Braj": ["yes"],
        "Haryanvi": ["yes"],
        "Kannauji": ["yes"],
        "Bundeli": ["yes"],
        "Awadhi": ["yes"],
        "Chakma": ["yes + ?", "Huziwara, K. (2003)"],
        "Southeast Pashayi": ["no + tone", "Lamuwal, A. E. M. and Baker, A. (2013); Bashir, E. (2003)"],
        "Tirahi": ["no", "Grierson, G. (1925)"],
        "Torwali": ["yes", "Bashir, E. (2003)"],
        "Kalasha": ["yes", "Bashir, E. (2003)"],
        "Indus Kohistani": ["yes", "Bashir, E. (2003)"],
        "Khowar": ["no + tone", "Bashir, E. (2003)"],
        "Gojri": ["no + tone", "Losey (2002)"],
        "Bhadrawahi": ["yes"],
    },
    "tr": {
        "Kholosi": ["tVr"],
        "Sindhi": ["ṭr", "Masica (1991)"],
        "Punjabi": ["ttar", "Masica (1991)"],
        "Saraiki": ["tr", "Masica (1991)"],
        "Khetrani": ["tr", "Masica (1991)"],
        "Hindi": ["t"],
    },
    "first person": {
        "Hindi": ["Skt. ma-", "", "mɛ̃"],
        "Punjabi": ["Skt. ma-", "", "mɛ̃"],
        "Saraiki": ["Skt. ma-", "", "mɛ̃"],
        "Shina": ["Skt. ma-", "", "mə"],
        "Nepali": ["Skt. ma-", "", "ma"],
        "Palula": ["Skt. ma-", "", "ma"],
        "Assamese": ["Skt. ma-", "", "mui"],
        "Marathi": ["Skt. ma-", "", "mī"],
        "Odia": ["Skt. ma-", "", "mū̃"],
        "Gujarati": ["Skt. ahám", "", "hũ"],
        "Marwari": ["Skt. ahám", "", "hũ"],
        "Sindhi": ["Skt. ahám", "", "āū̃"],
        "Siroli": ["Skt. ma-", "", "mā̃"],
        "Sauji": ["Skt. ma-", "", "ma"],
        "Thari": ["Skt. ahám", "", "hū̃"],
        "Siraji": ["Skt. ahám", "", "ɑ̃ːw"],
        "Lasi": ["Skt. ahám", "", "ā̃"],
        "Dameli": ["Skt. ahám", "", "ay"],
        "Khetrani": ["Skt. ahám", "", "ā̃"],
        "Lari": ["Skt. ma-", "", "mū̃"],
        "Konkani": ["Skt. ahám", "", "hā̃v"],
        "Bengali": ["Skt. asmé", "", "āmi"],
        "Sylheti": ["Skt. asmé", "", "āmi"],
        "Kashmiri": ["Skt. vayám", "", "bɨ"],
        "Kholosi": ["Skt. ma-", "", "môy"],
        "Kachchi": ["Skt. ahám", "", "au"],
        "Sinhala": ["Skt. ma-", "", "mama"],
    },
    "warm": {
        "Hindi": ["Persian garm", "", "garam"],
        "Nepali": ["Sanskrit *nidahana", "", "nyāno"],
        "Punjabi": ["Persian garm", "", "garam"],
        "Bhojpuri": ["Persian garm", "", "garam"],
        "Sindhi": ["OIA *koṣma", "", "koso"],
        "Kholosi": ["OIA *koṣma", "", "koso"],
        "Gujarati": ["Persian garm", "", "garam"],
        "Marathi": ["Persian garm", "", "garam"],
        "Bengali": ["Persian garm", "", "gôrôm"],
        "Assamese": ["Persian garm", "", "gorom"],
        "Odia": ["Persian garm", "", "gôrômô"],
        "Sinhala": ["Sanskrit uṣṇá", "", "uṇusum"],
        "Chinali": ["Sanskrit taptá", "", "tātu"],
        "Chambeali": ["Sanskrit taptá", "", "tatā"],
        "Gaddi": ["OIA *koṣma", "", "koslā"],
        "Bilaspuri": ["Sanskrit taptá", "", "tattā"],
        "Mandeali": ["Sanskrit taptá", "", "tātā"],
        "Awadhi": ["Sanskrit taptá", "", "tāt"],
        "Haryanvi": ["Sanskrit taptá", "", "tātā"],
        "Palula": ["Sanskrit taptá", "", "táatu"],
        "Saraiki": ["Sanskrit taptá", "", "tattā"],
        "Konkani": ["Sanskrit uṣṇá", "", "hūn"],
        "Kashmiri": ["Persian garm", "", "garɨm"]
    }
}

for (option in data) {
    dropdown.append("option").text(option)
}

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)

Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json")
]).then(function (files) {
    load(files[0])
})

function load(world) {
    topo = topojson.feature(world, world.objects.land).features
    g.selectAll("path")
        .data(topo)
        .enter()
        .append("path")
            .attr("id", "land")
            .attr("d", path)
            .attr("fill", "#EEE")
            .attr("stroke", "black")
            .attr("stroke-width", 0.2)
    
    dimension("voiced aspirates")
}

function dimension(type) {
    legend.html("")
    g.selectAll("text").remove()
    console.log(type)
    info.html(description[type])
    console.log(data[type])

    var vals = {}

    for (key in data[type]) {
        if (!(key in data[type])) continue
        if (!(data[type][key][0] in vals)) vals[data[type][key][0]] = 0;
        vals[data[type][key][0]]++;
        var loc = projection([locs[key][1], locs[key][0]])
        g.append("text")
            .attr("x", loc[0])
            .attr("y", loc[1])
            .attr("font-size", 20)
            .style("opacity", 0.8)
            .text(data[type][key][2] || data[type][key][0])
            .style("font-weight", "bold")
            .style("font-family", "Arial")
            .attr("data-name", key)
            .attr("fill", function() {
                return stringToColour(data[type][key][0])
            })
            .on("mouseover", function() {
                var name = d3.select(this).attr("data-name")
                tooltip.style("opacity", 1)
                    .html("<h5>" + name + "</h5><p>" + data[type][name][0] + (data[type][name][1] ? "<br><small>" + data[type][name][1] + "</small>" : "") + "</p>")
                    .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 28) + "px")
            })
            .on("mousemove", function () {
                tooltip.style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 28) + "px")
            })
            .on("mouseout", function() {
                tooltip.style("opacity", 0)
                    .style("left", -100)
                    .style("top", -100)
            })
    }

    for (option in vals) {
        legend.html(legend.html() + `<span style="color: ${stringToColour(option)}">⬤</span> ${option} <small>(${vals[option]})</small><br>`)
    }
}
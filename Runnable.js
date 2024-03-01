
const fs = require('fs');

const data = fs.readFileSync('./heartrate.json');
const jsonData = JSON.parse(data);
const input = jsonData

const processData = (input) => {
    const result = [];

    const groupedData = input.reduce((acc, obj) => {
        const date = obj.timestamps.startTime.split('T')[0];
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(obj);
        return acc;
    }, {});

    for (const date in groupedData) {
        const data = groupedData[date];

        const beatsPerMinuteArray = data.map(obj => obj.beatsPerMinute);
        const min = Math.min(...beatsPerMinuteArray);
        const max = Math.max(...beatsPerMinuteArray);

        beatsPerMinuteArray.sort((a, b) => a - b);
        const median = beatsPerMinuteArray.length % 2 === 0
            ? (beatsPerMinuteArray[beatsPerMinuteArray.length / 2 - 1] + beatsPerMinuteArray[beatsPerMinuteArray.length / 2]) / 2
            : beatsPerMinuteArray[Math.floor(beatsPerMinuteArray.length / 2)];

        const latestDataTimestamp = data.reduce((latest, obj) => {
            const timestamp = new Date(obj.timestamps.endTime);
            if (!latest || timestamp > latest) {
                return timestamp;
            }
            return latest;
        }, null);

        result.push({
            "date": date,
            "min": min,
            "max": max,
            "median": median,
            "latestDataTimestamp": latestDataTimestamp.toISOString()
        });
    }

    return result;
};

const output = processData(input);

fs.writeFile('output.json', JSON.stringify(output, null, 2), (err) => {
    if (err) {
        console.error('Error writing JSON file:', err);
    } else {
        console.log('Data has been updated successfully into output.json File');
    }
});
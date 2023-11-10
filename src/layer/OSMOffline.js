import OSMSource from './OSMOfflineSource';
import tile from './tile';

export default function osmoffline(layerOptions) {
    const osmDefault = {};
    const osmOptions = Object.assign(osmDefault, layerOptions);

    function createSource() {
        return new OSMSource();
    }

    const osmSource = createSource();
    return tile(osmOptions, osmSource);
}
import OSMSource from 'ol/source/OSM';

class OSMOfflineSource extends OSMSource {
  constructor(options) {
    super({

    });
    super.setTileLoadFunction(this.myLoader);
  }

  myLoader(tile, src) {
    const path = new URL(src).pathname;
    const result = handleSearch(path);
    result.then((currentResult) => {
        const imageBuffer = currentResult.file;
        const imageBlog = new Blob([imageBuffer]);
        tile.getImage().src = URL.createObjectURL(imageBlog);
    }).catch ((e) => {
        console.log('Image could not be found' + e);
        const redBlob = fetchBlob('/img/png/red.png');
        redBlob.then((currentRedBlob) => {
            tile.getImage().src = URL.createObjectURL(currentRedBlob);
        });
    });
  }

    preload() {
        const images = ["/6/34/18.png", "/6/35/18.png", "/6/34/19.png", "/6/35/19.png", "/6/34/17.png", "/6/35/17.png", "/6/33/18.png", "/6/36/18.png", "/6/33/19.png", "/6/33/17.png", "/6/36/19.png", "/6/34/20.png",
            "/6/36/17.png", "/6/35/20.png", "/6/34/16.png", "/6/35/16.png", "/6/33/20.png", "/6/32/18.png", "/6/36/20.png", "/6/33/16.png", "/6/32/19.png", "/6/37/18.png", "/6/32/17.png", "/6/36/16.png",
            "/6/37/19.png", "/6/37/17.png", "/6/32/20.png", "/6/32/16.png", "/6/37/20.png", "/6/37/16.png", "/6/31/18.png", "/6/31/19.png", "/6/31/17.png", "/6/38/18.png", "/6/38/19.png", "/6/38/17.png",
            "/6/31/20.png", "/6/31/16.png", "/6/38/20.png", "/6/38/16.png"
        ];

        images.forEach((element) => {
            const url = `https://tile.openstreetmap.org${element}`;
            const blob = fetchBlob(url);
            blob.then((currentBlob) => {
                handleSubmit(element, currentBlob);
            });
        });
    }
}

export default OSMOfflineSource;

async function fetchBlob(url) {
  const response = await fetch(url);

  // Here is the significant part
  // reading the stream as a blob instead of json
  return response.blob();
}

const storeName = 'localFiles';
const storeKey = 'fileName';
const dbVersion = 1;
let db = null;

// IndexedDB Methods
const initIndexedDb = (dbName, stores) => {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(dbName, dbVersion);
		request.onerror = (event) => {
			reject(event.target.error);
		};
		request.onsuccess = (event) => {
			resolve(event.target.result);
		};
		request.onupgradeneeded = (event) => {
			stores.forEach((store) => {
				const objectStore = event.target.result.createObjectStore(store.name, {
					keyPath: store.keyPath
				});
				objectStore.createIndex(store.keyPath, store.keyPath, { unique: true });
			});
		};
	});
};

const clearEntriesFromIndexedDb = () => {
	const store = db.transaction(storeName, 'readwrite').objectStore(storeName);

	store.clear();

	store.transaction.oncomplete = () => {
        console.log('files removed');
        window.location.reload();
	};
};

const handleSearch = (searchInput) => {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction(storeName, 'readonly');
            const objectStore = transaction.objectStore(storeName);

            const index = objectStore.index(storeKey);
            const getRequest = index.get(searchInput);
            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    resolve(getRequest.result);
                } else {
                    const e = new Error('Hittades inte');
                    reject(e);
                }
            };
            getRequest.onerror = (event) => {
                reject(event.target.error);
            } 
        } catch (error) {
            console.log(error);
        }
    });
};

const handleSubmit = async (storeKey, file) => {
    const data = {
        fileName:storeKey,
        file:file
    }
	const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
	store.add(data);

	store.transaction.oncomplete = () => {
		console.log('file saved');
	};
};

const preloader = () => {
    const source =  new OSMOfflineSource();
    source.preload();
}

// Init event listeners
document.querySelector('#clear-button')?.addEventListener('click', clearEntriesFromIndexedDb);
document.querySelector('#preload-button')?.addEventListener('click', preloader);

window.addEventListener('load', async () => {
	db = await initIndexedDb('my-db', [{ name: storeName, keyPath: storeKey }]);
});
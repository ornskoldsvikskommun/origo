import OSMSource from 'ol/source/OSM';

class OSMOfflineSource extends OSMSource {
  constructor(options) {
    super({

    });
    super.setTileLoadFunction(this.myLoader);
  }

  myLoader(tile, src) {
    const path = new URL(src).pathname;
    const cursor = handleSearch(path);
    cursor.then((currentCursor) => {
        const imageBuffer = currentCursor.value.file;
        const imageBlog = new Blob([imageBuffer]);
        tile.getImage().src = URL.createObjectURL(imageBlog);
    });
    cursor.catch(() => {
        console.log('Image could not be found');
        //tile.setState(3);
    });
  }

    preload() {
        const images = ['/16/36167/17769.png', '/16/36180/17772.png', '/16/36180/17767.png', '/6/34/18.png', '/6/35/18.png', '/6/34/19.png', '/6/34/17.png', '/6/33/18.png', '/6/36/18.png', '/16/36167/17769.png'];

        images.forEach((element) => {
            const url = `https://tile.openstreetmap.org${element}`;
            const blob = fetchBlob(url);
            blob.then((currentBlob) => {
                handleSubmit(element, currentBlob);
            })
        });
    };
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
					keyPath: store.keyPath,
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
	};
};

const handleSearch = (searchInput) => {
    return new Promise((resolve, reject) => {
        try {
                const transaction = db.transaction(storeName, 'readonly').objectStore(storeName).openCursor();
                transaction.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        if (cursor.value[storeKey].toLowerCase().includes(searchInput.toLowerCase())) {
                            resolve(cursor);
                        }
                        cursor.continue();
                    };
                };
                transaction.onerror = (event) => {
                    reject(event.target.error);
                };
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
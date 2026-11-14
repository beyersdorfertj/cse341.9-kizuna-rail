const hookRegionSorter = () => {
    const regionSelect = document.getElementById('region-filter');
    if (regionSelect) {
        regionSelect.addEventListener('change', () => {
            const selectedRegion = regionSelect.value;
            const url = new URL(window.location.href);

            if (selectedRegion && selectedRegion !== 'all') {
                url.searchParams.set('region', selectedRegion);
            } else {
                url.searchParams.delete('region');
            }
            
            window.location.href = url.toString();
        });
    }
};

const hookSeasonSorter = () => {
    const seasonSelect = document.getElementById('season-filter');
    if (seasonSelect) {
        seasonSelect.addEventListener('change', () => {
            const selectedSeason = seasonSelect.value;
            const url = new URL(window.location.href);

            if (selectedSeason && selectedSeason !== 'all') {
                url.searchParams.set('season', selectedSeason);
            } else {
                url.searchParams.delete('season');
            }
            
            window.location.href = url.toString();
        });
    }
};

const hookTrainsCatalog = async () => {
    const listEl = document.getElementById('trains-list');
    const templateEl = document.getElementById('train-card-template');
    const loadingEl = document.getElementById('trains-loading');
    const errorEl = document.getElementById('trains-error');

    if (!listEl || !templateEl) {
        return;
    }

    try {
        const response = await fetch('/api/trains');
        if (!response.ok) {
            throw new Error(`Failed to load trains (${response.status})`);
        }

        const payload = await response.json();
        const trains = payload.trains || [];
        const fragment = document.createDocumentFragment();

        trains.forEach((train) => {
            const card = templateEl.content.cloneNode(true);
            const imageEl = card.querySelector('[data-field="image"]');

            imageEl.src = train.imageUrl;
            imageEl.alt = train.imageAlt || `${train.name} train`;

            card.querySelector('[data-field="name"]').textContent = train.name;
            card.querySelector('[data-field="operator"]').textContent = train.operator;
            card.querySelector('[data-field="type"]').textContent = train.type;
            card.querySelector('[data-field="speed"]').textContent = `${train.maxSpeedKmh} km/h`;
            card.querySelector('[data-field="seats"]').textContent = `${train.capacity} seats`;
            card.querySelector('[data-field="power"]').textContent = train.powerSource;
            card.querySelector('[data-field="description"]').textContent = train.description;
            card.querySelector('[data-field="best-for"]').textContent = train.bestFor;

            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);
        if (loadingEl) {
            loadingEl.hidden = true;
        }
    } catch (error) {
        if (loadingEl) {
            loadingEl.hidden = true;
        }
        if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = 'Unable to load trains right now. Please try again in a moment.';
        }
    }
};

const hookTripSchedules = () => {
    const sectionEl = document.getElementById('trip-schedules');
    const headingEl = document.getElementById('schedules-heading');
    const listEl = document.getElementById('schedules-list');
    const templateEl = document.getElementById('schedule-card-template');
    const loadingEl = document.getElementById('schedules-loading');
    const errorEl = document.getElementById('schedules-error');
    const emptyEl = document.getElementById('schedules-empty');
    const monthSelect = document.getElementById('schedule-month');

    if (!sectionEl || !listEl || !templateEl) {
        return;
    }

    const tripId = sectionEl.dataset.tripId;

    const loadSchedules = async (month) => {
        if (headingEl) {
            const selectedOption = monthSelect && monthSelect.options[monthSelect.selectedIndex];
            const selectedMonth = selectedOption ? selectedOption.textContent : 'All months';
            headingEl.textContent = `Available Schedules - ${selectedMonth}`;
        }

        if (loadingEl) {
            loadingEl.hidden = false;
        }
        if (errorEl) {
            errorEl.hidden = true;
        }
        if (emptyEl) {
            emptyEl.hidden = true;
        }
        listEl.replaceChildren();

        try {
            const url = new URL(`/api/trips/${encodeURIComponent(tripId)}/schedules`, window.location.origin);
            if (month) {
                url.searchParams.set('month', month);
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load schedules (${response.status})`);
            }

            const schedules = await response.json();
            if (loadingEl) {
                loadingEl.hidden = true;
            }

            if (!Array.isArray(schedules) || schedules.length === 0) {
                if (emptyEl) {
                    emptyEl.hidden = false;
                }
                return;
            }

            const fragment = document.createDocumentFragment();

            schedules.forEach((schedule) => {
                const card = templateEl.content.cloneNode(true);

                card.querySelector('[data-field="departure"]').textContent = schedule.departureTime;
                card.querySelector('[data-field="arrival"]').textContent = schedule.arrivalTime;

                const daysEl = card.querySelector('[data-field="days"]');
                (schedule.daysOfWeek || []).forEach((day) => {
                    const badge = document.createElement('span');
                    badge.className = 'day-badge';
                    badge.textContent = day.substring(0, 3);
                    daysEl.appendChild(badge);
                });

                card.querySelector('[data-field="book-link"]').href = `/trips/booking/${schedule.id}`;

                fragment.appendChild(card);
            });

            listEl.replaceChildren(fragment);
        } catch (error) {
            if (loadingEl) {
                loadingEl.hidden = true;
            }
            if (errorEl) {
                errorEl.hidden = false;
                errorEl.textContent = 'Unable to load schedules right now. Please try again in a moment.';
            }
        }
    };

    if (monthSelect) {
        monthSelect.addEventListener('change', async () => {
            await loadSchedules(monthSelect.value);
        });
    }

    loadSchedules();
};

document.addEventListener('DOMContentLoaded', () => {
    hookRegionSorter();
    hookSeasonSorter();
    hookTrainsCatalog();
    hookTripSchedules();
});
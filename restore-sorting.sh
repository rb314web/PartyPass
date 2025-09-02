#!/bin/bash

# Skrypt do przywrócenia sortowania po zbudowaniu indeksów
# Uruchom ten skrypt za kilka minut po wdrożeniu indeksów

echo "Przywracanie sortowania w getEventById..."

# Znajdź i zastąp linię z wyłączonym sortowaniem
sed -i 's|// orderBy('\''createdAt'\'', '\''desc'\'') - tymczasowo wyłączone do czasu zbudowania indeksu|orderBy('\''createdAt'\'', '\''desc'\'')|g' src/services/firebase/eventService.ts

echo "Sortowanie zostało przywrócone!"
echo "Sprawdź czy indeksy są gotowe w Firebase Console:"
echo "https://console.firebase.google.com/project/partypass-app-9539e/firestore/indexes"

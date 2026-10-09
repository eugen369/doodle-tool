# End-to-End-Ablauf: Poll anlegen, Session, Abstimmung, Ergebnis, PDF
# Voraussetzung: Backend läuft auf http://127.0.0.1:3000
# Ausführen:     hurl --test backend/tests/polls.hurl

# 1. Poll anlegen
POST http://127.0.0.1:3000/api/polls
Content-Type: application/json
{
  "title": "Team-Meeting",
  "timezone": "Europe/Berlin",
  "slots": [
    { "startsAt": "2025-01-20T13:00:00Z" },
    { "startsAt": "2025-01-21T09:00:00Z" }
  ]
}

HTTP 201
[Captures]
poll_id: jsonpath "$.id"
[Asserts]
jsonpath "$.title" == "Team-Meeting"
jsonpath "$.moderatorToken" exists

# 2. Poll abrufen, Slot-ID merken
GET http://127.0.0.1:3000/api/polls/{{poll_id}}

HTTP 200
[Captures]
slot_id: jsonpath "$.slots[0].id"
[Asserts]
jsonpath "$.slots" count == 2

# 3. Teilnehmer-Session anlegen
POST http://127.0.0.1:3000/api/polls/{{poll_id}}/sessions
Content-Type: application/json
{
  "name": "Thomas",
  "timezone": "Europe/Berlin"
}

HTTP 201
[Captures]
session_id: jsonpath "$.id"

# 4. Mit "ja" abstimmen
POST http://127.0.0.1:3000/api/votes?pollId={{poll_id}}&sessionId={{session_id}}
Content-Type: application/json
{
  "slotId": "{{slot_id}}",
  "status": "yes"
}

HTTP 201
[Asserts]
jsonpath "$.status" == "yes"

# 5. Ergebnis prüfen: der abgestimmte Slot hat eine Ja-Stimme
# Die Slots sind nach Zustimmung sortiert, also steht er vorne.
GET http://127.0.0.1:3000/api/polls/{{poll_id}}

HTTP 200
[Asserts]
jsonpath "$.slots[0].id" == "{{slot_id}}"
jsonpath "$.slots[0].yesCount" == 1

# 6. PDF-Export
GET http://127.0.0.1:3000/api/polls/{{poll_id}}/export/pdf

HTTP 200
[Asserts]
header "Content-Type" == "application/pdf"
bytes count > 100

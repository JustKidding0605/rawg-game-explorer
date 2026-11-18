from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_add_to_backlog():
    response = client.post("/api/backlog", json={"rawg_id": 999999, "name": "Test Game", "status": "Want to Play"})
    assert response.status_code == 200
    assert response.json()["name"] == "Test Game"

def test_get_and_filter_backlog():
    response = client.get("/api/backlog?status=Want to Play")
    assert response.status_code == 200
    assert any(g["rawg_id"] == 999999 for g in response.json())

def test_delete_from_backlog():
    response = client.delete("/api/backlog/999999")
    assert response.status_code == 200

    second_response = client.delete("/api/backlog/999999")
    assert second_response.status_code == 404
    
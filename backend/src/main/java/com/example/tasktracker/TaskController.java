package com.example.tasktracker;

import java.util.List;
import java.util.concurrent.ConcurrentNavigableMap;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final AtomicLong nextId = new AtomicLong(1);
    private final ConcurrentNavigableMap<Long, Task> tasks = new ConcurrentSkipListMap<>();

    @GetMapping
    public List<Task> listTasks() {
        return List.copyOf(tasks.descendingMap().values());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task addTask(@RequestBody NewTask request) {
        String title = request.title() == null ? "" : request.title().strip();
        if (title.isEmpty() || title.length() > 120) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a title of 1 to 120 characters.");
        }

        Task task = new Task(nextId.getAndIncrement(), title, false);
        tasks.put(task.id(), task);
        return task;
    }

    @PatchMapping("/{id}")
    public Task updateTask(@PathVariable long id, @RequestBody TaskStatus request) {
        if (request.completed() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provide a completed status.");
        }

        Task updated = tasks.computeIfPresent(id,
                (key, task) -> new Task(key, task.title(), request.completed()));
        if (updated == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable long id) {
        if (tasks.remove(id) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }

    public record Task(long id, String title, boolean completed) {}
    public record NewTask(String title) {}
    public record TaskStatus(Boolean completed) {}
}

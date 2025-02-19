package com.schoolmanagement.academic_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.academic_service.dto.request.StreamRequest;
import com.schoolmanagement.academic_service.dto.response.StreamResponse;
import com.schoolmanagement.academic_service.model.Stream;
import com.schoolmanagement.academic_service.repository.StreamRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class StreamService {

    private final StreamRepository streamRepository;

    public ResponseEntity<StreamResponse> addNewStream(StreamRequest streamRequest, String schoolId) {

        Stream newStream = new Stream();

        newStream.setSchoolId(schoolId);
        newStream.setStreamCode(streamRequest.getStreamCode());
        newStream.setStreamName(streamRequest.getStreamName());
        newStream.setActive(true);
        newStream.setCreated_at(LocalDateTime.now());
        newStream.setCreated_by("Admin");

        Stream savedStream = streamRepository.save(newStream);

        return ResponseEntity.ok(convertToStreamResponse(savedStream));

    }

    public ResponseEntity<StreamResponse> editStreamById(StreamRequest streamRequest, String schoolId,
            Long streamId) {

        Stream streamExists= streamRepository.findBySchoolAndStreamId(schoolId,streamId);
        if (streamExists == null) {
            log.error("Stream not found with id {}", streamId);
            return ResponseEntity.notFound().build();
        }
        streamExists.setStreamCode(streamRequest.getStreamCode());
        streamExists.setStreamName(streamRequest.getStreamName());
        streamExists.setUpdated_at(LocalDateTime.now());
        streamExists.setUpdated_by("updated");

        Stream savedStream= streamRepository.save(streamExists);

        return ResponseEntity.ok(convertToStreamResponse(savedStream));
    }

    public ResponseEntity<String> deleteStreamById(String schoolId, Long streamId) {

        Stream streamExists= streamRepository.findBySchoolAndStreamId(schoolId,streamId);
        if (streamExists == null) {
            log.error("Stream not found with id {}", streamId);
            return ResponseEntity.notFound().build();
        }

        streamExists.setActive(false);

        streamRepository.save(streamExists);
        return ResponseEntity.ok("Stream with id " + streamId + " deleted successfully.");
    }

    public ResponseEntity<StreamResponse> getStreamById(String schoolId, Long streamId) {

        Stream streamExists= streamRepository.findBySchoolAndStreamId(schoolId,streamId);
        if (streamExists == null) {
            log.error("Stream not found with id {}", streamId);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(convertToStreamResponse(streamExists));
    }

    public ResponseEntity<List<StreamResponse>> getAllStreamesBySchoolId(String schoolId) {

        List<Stream> streams = streamRepository.findAllSchoolStreamsThatIsActive(schoolId);

        return ResponseEntity.ok(streams.stream().map(this::convertToStreamResponse).collect(Collectors.toList()));
    }

    private StreamResponse convertToStreamResponse(Stream stream) {
        return StreamResponse.builder()
                .streamId(stream.getStreamId())
                .schoolId(stream.getSchoolId())
                .streamName(stream.getStreamName())
                .streamCode(stream.getStreamCode())
                .build();
    }
}
